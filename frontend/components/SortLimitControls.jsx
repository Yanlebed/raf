"use client";

export default function SortLimitControls({ params = {}, sort = "", limit = 12 }) {
  function updateParam(name, value) {
    const sp = new URLSearchParams(params);
    if (value == null || value === "") sp.delete(name);
    else sp.set(name, String(value));
    // Ensure both are included explicitly
    if (name !== "sort" && sort) sp.set("sort", String(sort));
    if (name !== "limit" && limit) sp.set("limit", String(limit));
    const qs = sp.toString();
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}?${qs}`;
      window.location.assign(url);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div className="muted" style={{ fontSize: 12 }}>Сортування:</div>
      <select
        value={sort || "rating_desc"}
        onChange={(e) => updateParam("sort", e.target.value)}
        style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }}
      >
        <option value="price_asc">Ціна ↑</option>
        <option value="price_desc">Ціна ↓</option>
        <option value="rating_desc">Найвищий рейтинг</option>
      </select>
      <div className="muted" style={{ fontSize: 12 }}>Показувати по</div>
      <select
        value={String(limit)}
        onChange={(e) => updateParam("limit", e.target.value)}
        style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }}
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}


