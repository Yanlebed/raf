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
  const [section, setSection] = useState("profile"); // profile | bookings | chats | logout
  const [bookingsTab, setBookingsTab] = useState("scheduled"); // scheduled | cancelled | history

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

  function renderProfile() {
    return (
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
    );
  }

  function filterBookings() {
    const now = new Date();
    const isCancelled = (s) => {
      if (!s) return false;
      const v = String(s).toLowerCase();
      return v.includes("отмен") || v.includes("скас") || v.includes("cancel");
    };
    const isCompleted = (s) => String(s).toLowerCase().includes("заверш") || String(s).toLowerCase().includes("completed");
    return (bookings || []).filter((b) => {
      const when = b.appointment_date ? new Date(b.appointment_date) : null;
      if (bookingsTab === "cancelled") return isCancelled(b.confirmation_status);
      if (bookingsTab === "history") return isCompleted(b.confirmation_status) || (when && when < now);
      // scheduled
      return !isCancelled(b.confirmation_status) && (!when || when >= now);
    });
  }

  function renderBookings() {
    const list = filterBookings();
    return (
      <div>
        <div style={{ display: "flex", gap: 18, marginBottom: 12, borderBottom: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
          {[
            {
              key: "scheduled",
              label: "Заплановані візити",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <polyline points="9,16 11,18 15,14" />
                </svg>
              ),
            },
            {
              key: "cancelled",
              label: "Скасовані візити",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ),
            },
            {
              key: "history",
              label: "Історія",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="1,4 1,10 7,10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-5" />
                  <polyline points="12,7 12,12 15,13.5" />
                </svg>
              ),
            },
          ].map((t) => {
            const active = bookingsTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setBookingsTab(t.key)}
                className="nav-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 36,
                  padding: "0 4px",
                  border: "none",
                  background: "transparent",
                  fontSize: 15,
                  fontWeight: 600,
                  color: active ? "var(--accent)" : "inherit",
                  borderBottom: active ? "3px solid var(--accent)" : "3px solid transparent",
                }}
              >
                <span aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        {loadingBookings ? (
          <div className="muted">Завантаження…</div>
        ) : list.length === 0 ? (
          <div className="muted">Нічого не знайдено.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {list.map((a) => (
              <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <strong>Запис #{a.id}</strong>
                  <span className="muted">{a.appointment_date ? new Date(a.appointment_date).toLocaleString() : "—"}</span>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>Послуга: {a.service_id} · Майстер: {a.master_id} · Статус: {a.confirmation_status}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <a className="button" href={`/bookings/${a.id}`} style={{ fontSize: 12, padding: "6px 10px" }}>Переглянути/перенести</a>
                  {!bookingsTab.startsWith("cancel") ? (
                    <button className="nav-link" onClick={() => cancelBooking(a.id)} disabled={busyId === a.id} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 12px" }}>Скасувати</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderChats() {
    return <div className="muted">Чати з'являться найближчим часом.</div>;
  }

  async function onLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  }

  if (loading) return <div>Завантаження…</div>;
  if (error) return <div style={{ color: "#b91c1c" }}>{error}</div>;

  const sectionTitle = section === "bookings" ? "Мої записи" : section === "chats" ? "Чати" : "Мій профіль";

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h1 className="hero-title" style={{ margin: 0 }}>{sectionTitle}</h1>
        <button type="button" onClick={onLogout} className="nav-link" style={{ height: 36, padding: "0 12px", border: "1px solid var(--border)", borderRadius: 6 }}>Вийти</button>
      </div>

      <div style={{ marginTop: 10, border: "1px solid var(--border)", borderRadius: 8, background: "#fff" }}>
        <nav style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--border)", padding: "10px 12px", flexWrap: "wrap", alignItems: "center" }}>
          {[{ key: "profile", label: "Профіль", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ) }, { key: "bookings", label: "Записи", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ) }, { key: "chats", label: "Чати", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
          ) }].map((it) => {
            const active = section === it.key;
            return (
              <button key={it.key} type="button" onClick={() => setSection(it.key)} className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 6px", border: "none", background: "transparent", fontSize: 16, fontWeight: 600, color: active ? "var(--accent)" : "inherit", borderBottom: active ? "3px solid var(--accent)" : "3px solid transparent" }}>
                <span aria-hidden>{it.icon}</span>
                <span>{it.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 12 }}>
          {section === "profile" && renderProfile()}
          {section === "bookings" && renderBookings()}
          {section === "chats" && renderChats()}
        </div>
      </div>
    </section>
  );
}


