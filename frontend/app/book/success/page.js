export default function BookingSuccess({ searchParams }) {
  const id = searchParams?.id;
  return (
    <section>
      <h1 className="hero-title">Booking confirmed</h1>
      <p className="hero-subtitle">Your appointment has been created{ id ? ` (ID: ${id})` : "" }.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <a className="button" href="/bookings">View my bookings</a>
        <a className="nav-link" href="/services" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>Back to services</a>
      </div>
    </section>
  );
}


