export default async function SecurePage() {
  const res = await fetch("/api/me", { cache: "no-store" });
  if (!res.ok) {
    return (
      <section>
        <h1 className="hero-title">Access denied</h1>
        <p className="hero-subtitle">Please login to continue.</p>
      </section>
    );
  }
  const me = await res.json();
  return (
    <section>
      <h1 className="hero-title">Secure area</h1>
      <p className="hero-subtitle">Welcome back{me?.name ? `, ${me.name}` : me?.phone ? `, ${me.phone}` : ""}.</p>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div><span className="muted">User ID:</span> {me?.id}</div>
        <div><span className="muted">Email:</span> {me?.email || "—"}</div>
      </div>
    </section>
  );
}


