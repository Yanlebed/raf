"use client";

import { useEffect, useState } from "react";
import { getAppointment, rescheduleAppointment, cancelAppointment, updateAppointment } from "../../../lib/appointments";
import { useRouter } from "next/navigation";

export default function BookingDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAppointment(id)
      .then((a) => { if (mounted) { setAppt(a); setLoading(false); setDate(a ? a.appointment_date.slice(0,10) : ""); } })
      .catch((e) => { if (mounted) { setError(e?.message || "Failed to load"); setLoading(false); } });
    return () => { mounted = false; };
  }, [id]);

  async function loadSlots(d) {
    if (!appt || !appt.service_id || !appt.master_id || !d) return setSlots([]);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/services/public/${appt.service_id}/masters/${appt.master_id}/slots?date=${encodeURIComponent(d)}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      setSlots(Array.isArray(data) ? data : []);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    if (date) loadSlots(date);
  }, [date, appt?.service_id, appt?.master_id]);

  async function onReschedule(e) {
    e.preventDefault();
    setError("");
    if (!date || !time) return setError("Select date and time");
    const iso = new Date(`${date}T${time}:00`).toISOString();
    setBusy(true);
    try {
      const updated = await rescheduleAppointment(id, iso);
      setAppt(updated);
      setDate("");
      setTime("");
    } catch (err) {
      setError(err?.message || "Failed to reschedule");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    const reason = prompt("Cancellation reason (optional)") || "";
    setBusy(true);
    try {
      // Update status with reason; do not delete to preserve history
      const updated = await updateAppointment(id, { confirmation_status: "Отменена клиентом", client_notes: reason || undefined });
      setAppt(updated);
    } catch (err) {
      setError(err?.message || "Failed to cancel");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div>Loading…</div>;
  if (!appt) return <div style={{ color: "#b91c1c" }}>{error || "Not found"}</div>;

  const when = new Date(appt.appointment_date);

  return (
    <section style={{ maxWidth: 560 }}>
      <h1 className="hero-title">Booking #{appt.id}</h1>
      <p className="hero-subtitle">{when.toLocaleString()}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div><span className="muted">Service ID:</span> {appt.service_id}</div>
        <div><span className="muted">Master ID:</span> {appt.master_id}</div>
        <div><span className="muted">Status:</span> {appt.confirmation_status}</div>
      </div>
      {error ? <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div> : null}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="nav-link" onClick={onCancel} disabled={busy} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 40, padding: "0 12px" }}>Cancel</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Reschedule</h3>
        <form onSubmit={onReschedule} style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
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
                  const value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                  const label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const selected = time === value;
                  return (
                    <button key={iso} type="button" onClick={() => setTime(value)} className="nav-link" style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 10px", background: selected ? "var(--accent)" : "white", color: selected ? "#fff" : "inherit" }}>{label}</button>
                  );
                })}
              </div>
            )}
          </div>
          <input type="hidden" value={time} readOnly />
          <button className="button" type="submit" disabled={busy}>{busy ? "Updating…" : "Update"}</button>
        </form>
      </div>
      <div style={{ marginTop: 12 }}>
        <a className="nav-link" href="/bookings" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>← Back to bookings</a>
      </div>
    </section>
  );
}


