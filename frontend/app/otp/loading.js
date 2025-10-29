export default function LoadingOtp() {
  return (
    <section style={{ maxWidth: 420 }}>
      <h1 className="hero-title">Login via OTP</h1>
      <p className="hero-subtitle">Setting up OTP flow…</p>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <div className="muted" style={{ marginBottom: 4 }}>Phone</div>
          <div style={{ width: "100%", height: 40, background: "#f3f4f6", borderRadius: 8 }} />
        </div>
        <div style={{ width: 140, height: 40, background: "#e2e8f0", borderRadius: 8 }} />
      </div>
    </section>
  );
}


