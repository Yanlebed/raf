"use client";

import { useState } from "react";

export default function SearchFilters({ initialParams = {} }) {
  const [showMore, setShowMore] = useState(false);

  const {
    q = "",
    city = "",
    start = "",
    end = "",
    limit = 12,
    price_min = "",
    price_max = "",
    max_distance_km = "",
    rating_min = "",
    accept_home = "",
    at_salon = "",
    own_premises = "",
    visiting_client = "",
    view = "grid",
  } = initialParams || {};

  return (
    <form method="GET" style={{ display: "grid", gap: 10 }}>
      {/* Preserve existing search params */}
      {q ? <input type="hidden" name="q" value={q} /> : null}
      {city ? <input type="hidden" name="city" value={city} /> : null}
      {start ? <input type="hidden" name="start" value={start} /> : null}
      {end ? <input type="hidden" name="end" value={end} /> : null}
      {limit ? <input type="hidden" name="limit" value={String(limit)} /> : null}
      {view ? <input type="hidden" name="view" value={view} /> : null}

      <div style={{ fontWeight: 700 }}>Фільтри</div>

      <div style={{ display: "grid", gap: 6 }}>
        <div className="muted">Ціна, ₴</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input name="price_min" defaultValue={price_min} placeholder="від" style={{ width: 90, height: 36, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 8 }} />
          <input name="price_max" defaultValue={price_max} placeholder="до" style={{ width: 90, height: 36, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 8 }} />
        </div>
      </div>

      

      <div style={{ display: "grid", gap: 6 }}>
        <div className="muted">Прийом</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="accept_home" defaultChecked={!!accept_home} /> На дому
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="at_salon" defaultChecked={!!at_salon} /> У салоні
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="own_premises" defaultChecked={!!own_premises} /> Власне приміщення
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="visiting_client" defaultChecked={!!visiting_client} /> Виїзд до клієнта
        </label>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div className="muted">Рейтинг</div>
        <select name="rating_min" defaultValue={rating_min} style={{ width: 140, height: 36, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 8 }}>
          <option value="">Будь-який</option>
          <option value="3">3+ ⭐</option>
          <option value="4">4+ ⭐</option>
          <option value="4.5">4.5+ ⭐</option>
          <option value="5">Тільки 5 ⭐</option>
        </select>
      </div>

      <button type="button" className="nav-link" onClick={() => setShowMore((v) => !v)}>
        {showMore ? "− Згорнути" : "+ Додатково"}
      </button>

      {showMore ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div className="muted">Додаткові фільтри (з'являться згодом)</div>
          <input placeholder="Напр. мова, інструменти, сертифікати" style={{ height: 36, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 8 }} />
        </div>
      ) : null}

      <button className="button" type="submit" style={{ marginTop: 6 }}>Застосувати</button>
    </form>
  );
}


