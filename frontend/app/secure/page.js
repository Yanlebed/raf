import { getSiteOrigin } from "../../lib/site";

export default async function SecurePage() {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/me`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <section>
        <h1 className="hero-title">Доступ заборонено</h1>
        <p className="hero-subtitle">Будь ласка, увійдіть, щоб продовжити.</p>
      </section>
    );
  }
  const me = await res.json();
  return (
    <section>
      <h1 className="hero-title">Захищений розділ</h1>
      <p className="hero-subtitle">Раді вас бачити{me?.name ? `, ${me.name}` : me?.phone ? `, ${me.phone}` : ""}.</p>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div><span className="muted">ID користувача:</span> {me?.id}</div>
        <div><span className="muted">Email:</span> {me?.email || "—"}</div>
      </div>
    </section>
  );
}


