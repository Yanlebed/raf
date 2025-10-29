async function fetchService(id) {
  const res = await fetch(`/api/services/public/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ServiceDetailPage({ params }) {
  const { id } = params;
  const service = await fetchService(id);
  if (!service) {
    return (
      <section>
        <h1 className="hero-title">Service not found</h1>
        <a className="button" href="/services">Back to services</a>
      </section>
    );
  }
  return (
    <section>
      <h1 className="hero-title">{service.name}</h1>
      {service.description ? <p className="hero-subtitle">{service.description}</p> : null}
      <div style={{ display: "grid", gap: 8 }}>
        <div><span className="muted">ID:</span> {service.id}</div>
        {typeof service.price === "number" ? <div><span className="muted">Price:</span> {service.price}</div> : null}
        {typeof service.duration === "number" ? <div><span className="muted">Duration:</span> {service.duration} min</div> : null}
        {service.category ? <div><span className="muted">Category:</span> {String(service.category)}</div> : null}
        <div><span className="muted">Active:</span> {String(service.is_active)}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <a className="nav-link" href="/services">← Back to list</a>
      </div>
    </section>
  );
}


