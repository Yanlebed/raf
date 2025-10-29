export default async function ServicesPage({ searchParams }) {
  const city = searchParams?.city ?? "Kyiv";
  const q = searchParams?.q ?? "";
  const limit = Math.max(1, Math.min(50, parseInt(searchParams?.limit ?? "12", 10) || 12));
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const skip = (page - 1) * limit;
  const qs = new URLSearchParams({ city, limit: String(limit), skip: String(skip) });
  if (q) qs.set("q", q);
  const res = await fetch(`/api/services/public?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [], total: 0 };
  const items = data.items || [];
  const total = typeof data.total === "number" ? data.total : items.length;
  const showingStart = items.length ? skip + 1 : 0;
  const showingEnd = skip + items.length;
  const hasPrev = page > 1;
  const hasNext = skip + items.length < total;

  const baseParams = new URLSearchParams({ city, limit: String(limit) });
  if (q) baseParams.set("q", q);
  const prevParams = new URLSearchParams(baseParams);
  prevParams.set("page", String(page - 1));
  const nextParams = new URLSearchParams(baseParams);
  nextParams.set("page", String(page + 1));
  return (
    <section>
      <h1 className="hero-title">Services</h1>
      <p className="hero-subtitle">Public services available for booking.</p>
      <form method="GET" style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search"
          style={{ flex: 1, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <input
          name="city"
          defaultValue={city}
          placeholder="City"
          style={{ width: 160, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <input
          name="limit"
          defaultValue={String(limit)}
          type="number"
          min={1}
          max={50}
          style={{ width: 90, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          title="Items per page"
        />
        <button className="button" type="submit">Filter</button>
      </form>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {items.length === 0 ? (
          <div className="muted">No services found.</div>
        ) : (
          items.map((s) => (
            <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <strong><a href={`/services/${s.id}`}>{s.name}</a></strong>
                <span className="muted">
                  {s.category ? String(s.category) : ""}
                </span>
              </div>
              {s.description ? <div className="muted" style={{ marginTop: 6 }}>{s.description}</div> : null}
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {typeof s.price === "number" ? <div><span className="muted">Price:</span> {s.price}</div> : null}
                {typeof s.duration === "number" ? <div><span className="muted">Duration:</span> {s.duration} min</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div className="muted">{`Showing ${showingStart}-${showingEnd} of ${total}`}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`?${prevParams.toString()}`}
            className="nav-link"
            aria-disabled={!hasPrev}
            style={{ pointerEvents: hasPrev ? "auto" : "none", opacity: hasPrev ? 1 : 0.5 }}
          >Prev</a>
          <a
            href={`?${nextParams.toString()}`}
            className="nav-link"
            aria-disabled={!hasNext}
            style={{ pointerEvents: hasNext ? "auto" : "none", opacity: hasNext ? 1 : 0.5 }}
          >Next</a>
        </div>
      </div>
    </section>
  );
}


