export default function LoadingAccount() {
  return (
    <section>
      <h1 className="hero-title">My account</h1>
      <p className="hero-subtitle">Loading your profile…</p>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div style={{ width: 140, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
        <div style={{ width: 220, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
        <div style={{ width: 180, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
        <div style={{ width: 200, height: 14, background: "#f3f4f6", borderRadius: 4 }} />
      </div>
    </section>
  );
}


