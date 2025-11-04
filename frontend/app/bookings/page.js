import { getSiteOrigin } from "../../lib/site";

async function fetchAppointments() {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/appointments?limit=20&order=asc`, { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function MyBookingsPage() {
  const data = await fetchAppointments();
  const items = data.items || [];
  return (
    <section>
      <h1 className="hero-title">My bookings</h1>
      <p className="hero-subtitle">Upcoming and past appointments.</p>
      <div style={{ display: "grid", gap: 12 }}>
        {items.length === 0 ? <div className="muted">No appointments yet.</div> : null}
        {items.map((a) => (
          <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <strong><a href={`/bookings/${a.id}`}>Appointment #{a.id}</a></strong>
              <span className="muted">{new Date(a.appointment_date).toLocaleString()}</span>
            </div>
            <div className="muted" style={{ marginTop: 6 }}>Service ID: {a.service_id} · Master ID: {a.master_id}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


