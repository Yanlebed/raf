import { getSiteOrigin } from "../../../lib/site";

async function fetchSalon(id) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchRatingSummary(salonId) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/reviews/summary?salon_id=${encodeURIComponent(salonId)}`, { cache: "no-store" });
  if (!res.ok) return { avg: null, count: 0 };
  return res.json();
}

async function fetchServicesBySalon(city, salonId) {
  // Fetch public services for the city and filter by owner_org_id
  const qs = new URLSearchParams({ city: city || "Kyiv", limit: String(500), skip: String(0) });
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/services/public?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.filter((s) => s.owner_org_id === Number(salonId));
}

export default async function SalonDetailPage({ params }) {
  const { id } = params;
  const salon = await fetchSalon(id);
  if (!salon) {
    return (
      <section>
        <h1 className="hero-title">Салон не знайдено</h1>
        <a className="button" href="/salons">Повернутися до салонів</a>
      </section>
    );
  }
  const rating = await fetchRatingSummary(id);
  const services = await fetchServicesBySalon(salon.city || "Kyiv", id);
  return (
    <section>
      <nav aria-label="breadcrumbs" className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
        <a href="/" className="nav-link">Головна</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <a href="/salons" className="nav-link">Салони</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{salon.name || `Салон #${salon.id}`}</span>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 className="hero-title" style={{ margin: 0 }}>{salon.name || `Салон #${salon.id}`}</h1>
        {typeof rating?.avg === "number" ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "4px 10px", fontSize: 14 }}>⭐ {Number(rating.avg).toFixed(1)}{typeof rating.count === "number" ? ` (${rating.count})` : ""}</div>
        ) : null}
      </div>
      <p className="hero-subtitle">{salon.city || "Місто"}{salon.address ? `, ${salon.address}` : ""}</p>
      {salon.short_description ? <div className="muted" style={{ marginTop: 6 }}>{salon.short_description}</div> : null}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Послуги салону</h3>
        {services.length === 0 ? (
          <div className="muted">Поки що немає опублікованих послуг.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {services.map((s) => (
              <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <strong><a href={`/services/${s.id}`}>{s.name}</a></strong>
                  {typeof s.price === "number" ? <span className="muted">{Math.round(s.price)} ₴</span> : null}
                </div>
                {s.description ? <div className="muted" style={{ marginTop: 6 }}>{s.description}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="/salons" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>← До списку салонів</a>
      </div>
    </section>
  );
}



