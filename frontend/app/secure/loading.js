export default function LoadingSecure() {
  return (
    <section>
      <h1 className="hero-title">Secure area</h1>
      <p className="hero-subtitle">Validating your session…</p>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div style={{ width: 260, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
        <div style={{ width: 220, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
      </div>
    </section>
  );
}


