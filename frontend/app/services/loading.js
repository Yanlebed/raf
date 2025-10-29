export default function LoadingServices() {
  const skeletons = Array.from({ length: 12 });
  return (
    <section>
      <h1 className="hero-title">Services</h1>
      <p className="hero-subtitle">Loading services…</p>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {skeletons.map((_, i) => (
          <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ width: 180, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
              <div style={{ width: 80, height: 12, background: "#f3f4f6", borderRadius: 4 }} />
            </div>
            <div style={{ marginTop: 6, width: "90%", height: 12, background: "#f3f4f6", borderRadius: 4 }} />
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div style={{ width: 100, height: 12, background: "#f3f4f6", borderRadius: 4 }} />
              <div style={{ width: 120, height: 12, background: "#f3f4f6", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


