export default function PromosPage() {
  const promos = [];
  return (
    <section>
      <h1 className="hero-title">Спеціальні пропозиції</h1>
      <p className="hero-subtitle">Тут з'являться актуальні акції та знижки від майстрів і салонів.</p>
      {promos.length === 0 ? (
        <div className="muted" style={{ marginTop: 12 }}>Наразі пропозицій немає. Завітайте пізніше.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
          {promos.map((p) => (
            <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div className="muted" style={{ marginTop: 6 }}>{p.subtitle}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


