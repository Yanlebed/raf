"use client";

export default function Error({ error, reset }) {
  return (
    <section>
      <h1 className="hero-title">Service error</h1>
      <p className="hero-subtitle">{error?.message || "Failed to load service."}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={() => reset()}>Retry</button>
        <a href="/services" className="nav-link" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>Back to list</a>
      </div>
    </section>
  );
}


