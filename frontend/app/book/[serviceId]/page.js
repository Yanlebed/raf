"use client";

import { useEffect, useMemo, useState } from "react";
import { placeHold } from "../../../lib/booking";
import { useRouter, useSearchParams } from "next/navigation";

async function fetchService(id) {
  const res = await fetch(`/api/services/public/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default function BookServicePage({ params }) {
  const router = useRouter();
  const { serviceId } = params;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [masterId, setMasterId] = useState("");
  const [masters, setMasters] = useState([]);
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "local time", []);

  function formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const maxISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return formatDateISO(d);
  }, []);

  function clampDateISO(value) {
    if (!value) return value;
    if (value < todayISO) return todayISO;
    if (value > maxISO) return maxISO;
    return value;
  }

  async function loadSlots(d) {
    if (!d) return setSlots([]);
    setLoadingSlots(true);
    try {
      let url;
      if (masterId) {
        url = `/api/services/public/${serviceId}/masters/${masterId}/slots?date=${encodeURIComponent(d)}`;
      } else {
        url = `/api/services/public/${serviceId}/slots?date=${encodeURIComponent(d)}`;
      }
      const res = await fetch(url, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      setSlots(Array.isArray(data) ? data : []);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetchService(serviceId).then((s) => {
      if (!mounted) return;
      setService(s);
      setLoading(false);
      // initialize date to today if empty
      setDate((prev) => prev || todayISO);
      // load masters if org-owned or missing owner_user_id
      if (s && (!s.owner_user_id && s.owner_org_id)) {
        fetch(`/api/services/public/${serviceId}/masters`, { cache: "no-store" })
          .then((r) => r.ok ? r.json() : [])
          .then((list) => {
            if (!mounted) return;
            setMasters(Array.isArray(list) ? list : []);
            if (list.length > 0) setMasterId(String(list[0].id));
          })
          .catch(() => {});
      } else if (s && s.owner_user_id) {
        setMasterId(String(s.owner_user_id));
      }
    });
    return () => { mounted = false; };
  }, [serviceId]);

  useEffect(() => {
    loadSlots(date);
  }, [date, masterId]);

  // Week navigation helpers
  function toDate(value) {
    const [y, m, d] = value.split("-").map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d);
  }

  function addDays(value, days) {
    const base = toDate(value);
    base.setDate(base.getDate() + days);
    return clampDateISO(formatDateISO(base));
  }

  function startOfWeek(value) {
    const base = toDate(value || todayISO);
    // Monday as first day (0=Sun → 1=Mon)
    const day = base.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // move to Monday
    return formatDateISO(new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff));
  }

  const weekDays = useMemo(() => {
    const start = startOfWeek(date || todayISO);
    const arr = [];
    for (let i = 0; i < 7; i++) {
      arr.push(addDays(start, i));
    }
    return arr;
  }, [date, todayISO]);

  const [weekSlotsCount, setWeekSlotsCount] = useState({});
  useEffect(() => {
    let cancelled = false;
    async function loadWeek() {
      const entries = await Promise.all(weekDays.map(async (d) => {
        let url;
        if (masterId) url = `/api/services/public/${serviceId}/masters/${masterId}/slots?date=${encodeURIComponent(d)}`;
        else url = `/api/services/public/${serviceId}/slots?date=${encodeURIComponent(d)}`;
        try {
          const res = await fetch(url, { cache: "no-store" });
          const list = res.ok ? await res.json() : [];
          return [d, Array.isArray(list) ? list.length : 0];
        } catch {
          return [d, 0];
        }
      }));
      if (!cancelled) setWeekSlotsCount(Object.fromEntries(entries));
    }
    if (weekDays.length) loadWeek();
    return () => { cancelled = true; };
  }, [JSON.stringify(weekDays), masterId, serviceId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!service) return;
    if (!date || !time) {
      setError("Please select date and time");
      return;
    }
    const startIso = new Date(`${date}T${time}:00`).toISOString();
    const duration = service.duration || 30;
    if (!masterId) {
      setError("Please select a master");
      return;
    }
    setBusy(true);
    try {
      const hold = await placeHold({ master_id: Number(masterId), service_id: service.id, start_time: startIso, duration_minutes: duration });
      const qp = new URLSearchParams({ hold_id: String(hold.id), start: startIso });
      router.push(`/book/${service.id}/confirm?${qp.toString()}`);
    } catch (err) {
      setError(err?.message || "Failed to place hold");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div>Loading…</div>;
  if (!service) return <div style={{ color: "#b91c1c" }}>Service not found.</div>;

  return (
    <section style={{ maxWidth: 520 }}>
      <h1 className="hero-title">Book: {service.name}</h1>
      <p className="hero-subtitle">Select date and time. Duration: {service.duration || 30} min. Times shown in {timeZone}.</p>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="nav-link" onClick={() => setDate((d) => addDays(d || todayISO, -7))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>« Prev week</button>
            <button type="button" className="nav-link" onClick={() => setDate((d) => addDays(d || todayISO, -1))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>‹ Prev day</button>
            <button type="button" className="nav-link" onClick={() => setDate(todayISO)} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>Today</button>
            <button type="button" className="nav-link" onClick={() => setDate(addDays(todayISO, 1))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>Tomorrow</button>
            <button type="button" className="nav-link" onClick={() => setDate((d) => addDays(d || todayISO, 1))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>Next day ›</button>
            <button type="button" className="nav-link" onClick={() => setDate((d) => addDays(d || todayISO, 7))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px" }}>Next week »</button>
          </div>
          {masters.length > 0 ? (
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Master</div>
              <select value={masterId} onChange={(e) => setMasterId(e.target.value)} style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                {masters.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name || m.phone || `Master ${m.id}`}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <div className="muted" style={{ marginBottom: 4 }}>Date</div>
            <input
              type="date"
              value={date}
              min={todayISO}
              max={maxISO}
              onChange={(e) => setDate(clampDateISO(e.target.value))}
              required
              style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
            />
          </label>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>This week</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {weekDays.map((d) => {
                const label = new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                const selected = date === d;
                const count = weekSlotsCount[d] ?? null;
                const disabled = count === 0;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => !disabled && setDate(d)}
                    className="nav-link"
                    aria-disabled={disabled}
                    style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px", background: selected ? "var(--accent)" : "white", color: selected ? "#fff" : "inherit", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                  >
                    {label}{count !== null ? ` (${count})` : ""}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>Available times</div>
            {loadingSlots ? (
              <div className="muted">Loading slots…</div>
            ) : slots.length === 0 ? (
              <div className="muted">No available slots for this day.</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {slots.map((iso) => {
                  const d = new Date(iso);
                  const label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                  const selected = time === value;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setTime(value)}
                      className="nav-link"
                      style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px", background: selected ? "var(--accent)" : "white", color: selected ? "#fff" : "inherit" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <input type="hidden" value={time} readOnly />
          {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
          <button className="button" type="submit" disabled={busy}>{busy ? "Holding…" : "Hold slot"}</button>
        </div>
      </form>
    </section>
  );
}


