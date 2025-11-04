import { getSiteOrigin } from "../../../lib/site";

async function fetchService(id) {
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/services/public/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ServiceDetailPage({ params }) {
  const { id } = params;
  const service = await fetchService(id);
  if (!service) {
    return (
      <section>
        <h1 className="hero-title">Послугу не знайдено</h1>
        <a className="button" href="/services">Повернутися до послуг</a>
      </section>
    );
  }
  return (
    <section>
      <nav aria-label="breadcrumbs" className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
        <a href="/" className="nav-link">Головна</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <a href="/services" className="nav-link">Послуги</a>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{service.name}</span>
      </nav>
      <h1 className="hero-title">{service.name}</h1>
      {service.description ? <p className="hero-subtitle">{service.description}</p> : null}
      <div style={{ display: "grid", gap: 8 }}>
        <div><span className="muted">ID:</span> {service.id}</div>
        {typeof service.price === "number" ? <div><span className="muted">Ціна:</span> {service.price}</div> : null}
        {typeof service.duration === "number" ? <div><span className="muted">Тривалість:</span> {service.duration} хв</div> : null}
        {service.category ? <div><span className="muted">Категорія:</span> {String(service.category)}</div> : null}
        <div><span className="muted">Активна:</span> {String(service.is_active)}</div>
        {service.owner_user_id ? (
          <div><span className="muted">Майстер:</span> <a href={`/masters/${service.owner_user_id}`}>Переглянути профіль</a></div>
        ) : null}
      </div>
      <div style={{ marginTop: 12 }}>
        <a className="button" href={`/book/${service.id}`}>Записатися</a>
        <a className="nav-link" href="/services" style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", height: 40 }}>← До списку</a>
      </div>
    </section>
  );
}


