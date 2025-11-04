"use client";

import { useEffect, useState } from "react";
import { fetchMe, updateMe } from "../../lib/auth";
import { updateAppointment } from "../../lib/appointments";

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMe();
        if (mounted) setMe(data);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/appointments?limit=20&order=asc`, { cache: "no-store" });
        const data = res.ok ? await res.json() : { items: [] };
        if (!cancelled) setBookings(data.items || []);
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const payload = { name: me.name || null, email: me.email || null, city: me.city || null, address: me.address || null, short_description: me.short_description || null };
      const updated = await updateMe(payload);
      setMe(updated);
      setMsg("Профіль оновлено.");
    } catch (err) {
      setError(err?.message || "Не вдалося зберегти");
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking(id) {
    setBusyId(id);
    setError("");
    try {
      const updated = await updateAppointment(id, { confirmation_status: "Отменена клиентом" });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err?.message || "Не вдалося скасувати запис");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div>Завантаження…</div>;
  if (error) return <div style={{ color: "#b91c1c" }}>{error}</div>;

  return (
    <section>
      <h1 className="hero-title">Мій профіль</h1>
      <form onSubmit={onSave} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <div className="muted">ID: {me?.id}</div>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Телефон</div>
          <input value={me?.phone || ""} readOnly style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "#f9fafb" }} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Email</div>
          <input value={me?.email || ""} onChange={(e) => setMe((m) => ({ ...m, email: e.target.value }))} type="email" placeholder="you@example.com" style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Ім'я</div>
          <input value={me?.name || ""} onChange={(e) => setMe((m) => ({ ...m, name: e.target.value }))} style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Місто</div>
          <input value={me?.city || ""} onChange={(e) => setMe((m) => ({ ...m, city: e.target.value }))} style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Адреса</div>
          <input value={me?.address || ""} onChange={(e) => setMe((m) => ({ ...m, address: e.target.value }))} style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Короткий опис</div>
          <textarea value={me?.short_description || ""} onChange={(e) => setMe((m) => ({ ...m, short_description: e.target.value }))} rows={3} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        {msg ? <div className="muted">{msg}</div> : null}
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
        <div>
          <button className="button" type="submit" disabled={saving}>{saving ? "Зберігаємо…" : "Зберегти"}</button>
        </div>
      </form>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Мої записи</h2>
        {loadingBookings ? (
          <div className="muted" style={{ marginTop: 8 }}>Завантаження…</div>
        ) : bookings.length === 0 ? (
          <div className="muted" style={{ marginTop: 8 }}>Немає записів.</div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {bookings.map((a) => (
              <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <strong>Запис #{a.id}</strong>
                  <span className="muted">{new Date(a.appointment_date).toLocaleString()}</span>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>Послуга: {a.service_id} · Майстер: {a.master_id} · Статус: {a.confirmation_status}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <a className="button" href={`/bookings/${a.id}`} style={{ fontSize: 12, padding: "6px 10px" }}>Переглянути/перенести</a>
                  <button className="nav-link" onClick={() => cancelBooking(a.id)} disabled={busyId === a.id} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 12px" }}>Скасувати</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


