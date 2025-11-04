import { getSiteOrigin } from "../../../lib/site";
import MasterServicesAndSlots from "../../../components/MasterServicesAndSlots";

async function fetchMaster(id) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchRatingSummary(masterId) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/reviews/summary?master_id=${encodeURIComponent(masterId)}`, { cache: "no-store" });
  if (!res.ok) return { avg: null, count: 0 };
  return res.json();
}

async function fetchServicesByMaster(city, masterId) {
  // Fetch public services for the city and filter by owner_user_id
  const qs = new URLSearchParams({ city: city || "Kyiv", limit: String(500), skip: String(0) });
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/services/public?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.filter((s) => s.owner_user_id === Number(masterId));
}

export default async function MasterDetailPage({ params }) {
  const { id } = params;
  const master = await fetchMaster(id);
  if (!master) {
    return (
      <section>
        <h1 className="hero-title">Майстра не знайдено</h1>
        <a className="button" href="/masters">Повернутися до майстрів</a>
      </section>
    );
  }
  const rating = await fetchRatingSummary(id);
  const services = await fetchServicesByMaster(master.city || "Kyiv", id);
  return (
    <section>
      <nav aria-label="breadcrumbs" className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
        <a href="/" className="nav-link">Головна</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <a href="/masters" className="nav-link">Майстри</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{master.name || `Майстер #${master.id}`}</span>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div aria-hidden style={{ width: 56, height: 56, borderRadius: 999, border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>{master.avatar || "👤"}</div>
        <h1 className="hero-title" style={{ margin: 0 }}>{master.name || `Майстер #${master.id}`}</h1>
        {typeof rating?.avg === "number" ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "4px 10px", fontSize: 14 }}>⭐ {Number(rating.avg).toFixed(1)}{typeof rating.count === "number" ? ` (${rating.count})` : ""}</div>
        ) : null}
      </div>
      <p className="hero-subtitle">{master.city || "Місто"}{master.address ? `, ${master.address}` : ""}</p>
      {master.short_description ? <div className="muted" style={{ marginTop: 6 }}>{master.short_description}</div> : null}

      <div style={{ marginTop: 16 }}>
        {services.length === 0 ? (
          <div className="muted">Поки що немає опублікованих послуг.</div>
        ) : (
          <MasterServicesAndSlots masterId={Number(id)} services={services} defaultDateISO={new Date().toISOString().slice(0,10)} />
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <a className="nav-link" href="/services" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>← Назад до пошуку</a>
        <a className="nav-link" href="/masters" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>← До списку майстрів</a>
      </div>
    </section>
  );
}



