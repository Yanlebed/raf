import { getSiteOrigin } from "../../../lib/site";
import MasterServicesAndSlots from "../../../components/MasterServicesAndSlots";
import AnchorTabs from "../../../components/AnchorTabs";

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

async function fetchPhotos(masterId) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/services/public/masters/${masterId}/photos`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function fetchReviews(masterId) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/services/public/masters/${masterId}/reviews?limit=10&order=desc`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  return data.items || [];
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
  const [photos, reviews] = await Promise.all([fetchPhotos(id), fetchReviews(id)]);
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
        <AnchorTabs items={[
          { href: '#info', label: 'Загальна інформація' },
          { href: '#portfolio', label: 'Портфоліо' },
          { href: '#reviews', label: 'Відгуки' },
        ]} />
      </div>

      <div id="info" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Загальна інформація</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <div><span className="muted">Місто:</span> {master.city || "—"}</div>
          <div><span className="muted">Адреса:</span> {master.address || "—"}</div>
          <div><span className="muted">Досвід:</span> {typeof master.experience_years === "number" ? `${master.experience_years} років` : "—"}</div>
        </div>
      </div>

      <div id="portfolio" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Портфоліо</h3>
        {photos.length === 0 ? (
          <div className="muted">Поки що немає фото.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            {photos.map((url, i) => (
              <a key={`${url}-${i}`} href={url} target="_blank" rel="noreferrer" style={{ display: "block", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <img src={url} alt="Робота майстра" style={{ width: "100%", height: 140, objectFit: "cover" }} />
              </a>
            ))}
          </div>
        )}
      </div>

      <div id="reviews" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Відгуки</h3>
        <div className="muted">Середній рейтинг: {typeof rating?.avg === "number" ? rating.avg.toFixed(1) : "—"}{typeof rating?.count === "number" ? ` (${rating.count})` : ""}</div>
        <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
          {reviews.length === 0 ? <div className="muted">Немає відгуків.</div> : reviews.map((r) => (
            <div key={r.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div>⭐ {Number(r.rating).toFixed(1)}</div>
                <div className="muted" style={{ fontSize: 12 }}>{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</div>
              </div>
              {r.comment ? <div style={{ marginTop: 6 }}>{r.comment}</div> : null}
              {r.verified ? <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Підтверджено записом</div> : null}
            </div>
          ))}
        </div>
      </div>

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



