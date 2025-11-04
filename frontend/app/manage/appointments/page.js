"use client";

import { useEffect, useState } from "react";
import { listMyAppointments } from "../../../lib/booking";
import { rescheduleAppointment, cancelAppointment, updateAppointment } from "../../../lib/appointments";

export default function ManageAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [edit, setEdit] = useState({});
  const statusOptions = [
    "Ожидает подтверждения",
    "Подтверждена",
    "Отменена клиентом",
    "Отменена мастером",
    "Завершена",
  ];
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const hasPrev = page > 1;
  const hasNext = (page - 1) * limit + items.length < total;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listMyAppointments({ page, limit, order: "asc", startDate, endDate, status: filterStatus || undefined });
      setItems(data.items || []);
      setTotal(typeof data.total === "number" ? data.total : (data.items || []).length);
    } catch (err) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, limit, filterStatus, startDate, endDate]);

  function setEditField(id, field, value) {
    setEdit((e) => ({ ...e, [id]: { ...(e[id] || {}), [field]: value } }));
  }

  async function handleReschedule(id) {
    const e = edit[id] || {};
    if (!e.date || !e.time) return alert("Select date and time");
    setBusyId(id);
    try {
      await rescheduleAppointment(id, new Date(`${e.date}T${e.time}:00`).toISOString());
      await load();
    } catch (err) {
      alert(err?.message || "Failed to reschedule");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    setBusyId(id);
    try {
      await updateAppointment(id, { confirmation_status: "Отменена мастером" });
      await load();
    } catch (err) {
      alert(err?.message || "Failed to cancel");
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatus(id, value) {
    setBusyId(id);
    try {
      await updateAppointment(id, { confirmation_status: value });
      await load();
    } catch (err) {
      alert(err?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  const showingStart = items.length ? (page - 1) * limit + 1 : 0;
  const showingEnd = (page - 1) * limit + items.length;

  function fmtDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  function startOfWeek(d) {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday
    const base = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
    return base;
  }

  function endOfWeek(d) {
    const s = startOfWeek(d);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const header = ["id","appointment_date","service_id","master_id","client_id","confirmation_status","price"];
      const rows = [header];
      let curPage = 1;
      const pageLimit = 100; // backend max
      let fetched = 0;
      while (true) {
        const data = await listMyAppointments({ page: curPage, limit: pageLimit, order: "asc", startDate, endDate, status: filterStatus || undefined });
        const list = data.items || [];
        for (const a of list) {
          rows.push([
            a.id,
            a.appointment_date,
            a.service_id,
            a.master_id,
            a.client_id,
            a.confirmation_status,
            a.price ?? "",
          ].map((v) => {
            const s = String(v ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          }));
        }
        fetched += list.length;
        if (fetched >= (data.total || fetched) || list.length < pageLimit) break;
        curPage += 1;
        // Safety cap to avoid too many requests
        if (curPage > 200) break;
      }
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sd = startDate || ""; const ed = endDate || "";
      a.download = `appointments_${sd}_${ed}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section>
      <h1 className="hero-title">Manage appointments</h1>
      <p className="hero-subtitle">Masters/Admins can reschedule or cancel upcoming appointments.</p>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "8px 0 8px" }}>
        <label className="muted">From<input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} style={{ marginLeft: 6, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
        <label className="muted">To<input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} style={{ marginLeft: 6, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
        <label className="muted">Status
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} style={{ marginLeft: 6, height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
            <option value="">Any</option>
            {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
        <button className="button" type="submit">Apply</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className="nav-link" onClick={() => { const t = new Date(); setStartDate(fmtDateISO(t)); setEndDate(fmtDateISO(t)); setPage(1); }} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 34, padding: "0 10px" }}>Today</button>
          <button type="button" className="nav-link" onClick={() => { const t = new Date(); const s = startOfWeek(t); const e = endOfWeek(t); setStartDate(fmtDateISO(s)); setEndDate(fmtDateISO(e)); setPage(1); }} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 34, padding: "0 10px" }}>This week</button>
          <button type="button" className="nav-link" onClick={() => { const t = new Date(); const e = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 6); setStartDate(fmtDateISO(t)); setEndDate(fmtDateISO(e)); setPage(1); }} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 34, padding: "0 10px" }}>Next 7 days</button>
        </div>
        <button type="button" className="button" onClick={exportCsv} disabled={exporting}>{exporting ? "Exporting…" : "Export CSV"}</button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0" }}>
        <div className="muted">{`Showing ${showingStart}-${showingEnd} of ${total}`}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="nav-link" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!hasPrev} style={{ background: "transparent", border: 0, cursor: hasPrev ? "pointer" : "not-allowed", opacity: hasPrev ? 1 : 0.5 }}>Prev</button>
          <button className="nav-link" onClick={() => setPage((p) => p + 1)} disabled={!hasNext} style={{ background: "transparent", border: 0, cursor: hasNext ? "pointer" : "not-allowed", opacity: hasNext ? 1 : 0.5 }}>Next</button>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} style={{ height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((a) => {
            const when = new Date(a.appointment_date);
            const eid = edit[a.id] || {};
            return (
              <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <strong>#{a.id} · {when.toLocaleString()}</strong>
                  <span className="muted">Client {a.client_id} · Master {a.master_id}</span>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>Service {a.service_id}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <label className="muted">Status
                    <select defaultValue={a.confirmation_status} onChange={(e) => handleStatus(a.id, e.target.value)} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
                      {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <input type="date" value={eid.date || ""} onChange={(e) => setEditField(a.id, "date", e.target.value)} style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }} />
                  <input type="time" value={eid.time || ""} onChange={(e) => setEditField(a.id, "time", e.target.value)} step={300} style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }} />
                  <button className="button" onClick={() => handleReschedule(a.id)} disabled={busyId === a.id}>{busyId === a.id ? "Updating…" : "Reschedule"}</button>
                  <button className="nav-link" onClick={() => handleCancel(a.id)} disabled={busyId === a.id} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 12px" }}>Cancel</button>
                </div>
              </div>
            );
          })}
          {items.length === 0 ? <div className="muted">No appointments.</div> : null}
        </div>
      )}
    </section>
  );
}


