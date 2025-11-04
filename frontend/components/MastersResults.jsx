"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function groupByMaster(services) {
  const byMaster = new Map();
  for (const s of services || []) {
    if (!s.owner_user_id) continue;
    let entry = byMaster.get(s.owner_user_id);
    if (!entry) {
      entry = { masterId: s.owner_user_id, services: [], minPrice: s.price ?? null };
      byMaster.set(s.owner_user_id, entry);
    }
    entry.services.push(s);
    if (typeof s.price === "number") {
      entry.minPrice = entry.minPrice == null ? s.price : Math.min(entry.minPrice, s.price);
    }
  }
  return Array.from(byMaster.values());
}

async function fetchMaster(id) {
  const res = await fetch(`/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default function MastersResults({ items, ownersRatings = {}, ownersLocations = {}, userLocation = null }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "grid";
  const sort = searchParams.get("sort") || "";
  const grouped = useMemo(() => groupByMaster(items), [items]);
  const masterIds = useMemo(() => grouped.map((g) => g.masterId), [grouped]);
  const [masters, setMasters] = useState({});
  const [favs, setFavs] = useState(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(window.localStorage.getItem("favs") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const entries = await Promise.all(masterIds.map(async (id) => [id, await fetchMaster(id)]));
      if (!active) return;
      const map = {};
      for (const [id, data] of entries) map[id] = data;
      setMasters(map);
    })();
    return () => { active = false; };
  }, [masterIds.join(",")]);

  function toggleFav(id) {
    setFavs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== "undefined") window.localStorage.setItem("favs", JSON.stringify(next));
      return next;
    });
  }

  function renderCard(entry) {
    const m = masters[entry.masterId] || {};
    const name = m.name || `Майстер #${entry.masterId}`;
    const direction = entry.services[0]?.name || "Послуга";
    const minPrice = entry.minPrice != null ? Math.round(entry.minPrice) : null;
    const experience = m.experience_years; // may be undefined depending on schema
    const ratingInfo = ownersRatings?.[entry.masterId] || null;
    const rating = ratingInfo?.avg;
    const ratingCount = ratingInfo?.count;
    const dist = distanceFor(entry.masterId);
    const serviceId = entry.services[0]?.id;
    return (
      <div key={entry.masterId} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          <div style={{ position: "relative", width: view === "list" ? 130 : "100%", aspectRatio: view === "list" ? undefined : "1 / 1", background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div aria-hidden style={{ fontSize: view === "list" ? 44 : 54, lineHeight: 1 }}>{m.avatar || "👤"}</div>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <button type="button" aria-label="Додати до обраних" onClick={() => toggleFav(entry.masterId)} style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid var(--border)", background: "#fff" }}>{favs[entry.masterId] ? "❤️" : "🤍"}</button>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}><a href={`/masters/${entry.masterId}`}>{name}</a></div>
            <div className="muted" style={{ fontStyle: "italic", fontSize: 12 }}>{direction}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {typeof experience === "number" ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "3px 6px", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>🛠️ {experience} років</div>
              ) : null}
              <div style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "3px 6px", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>⭐ {typeof rating === "number" ? rating.toFixed(1) : "—"}{typeof ratingCount === "number" ? ` (${ratingCount})` : ""}</div>
              {typeof minPrice === "number" ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "3px 6px", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>💰 від {minPrice} ₴</div>
              ) : null}
              {typeof dist === "number" ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "3px 6px", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>📍 {dist.toFixed(1)} км</div>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: "auto" }}>
              {serviceId ? <a className="button" href={`/services/${serviceId}`} style={{ fontSize: 12, padding: "6px 10px" }}>Записатися</a> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <div className="muted">Нічого не знайдено.</div>;
  }

  function distanceFor(masterId) {
    const loc = ownersLocations?.[masterId];
    if (!loc || !userLocation) return null;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(loc.lat - userLocation.lat);
    const dLon = toRad(loc.lon - userLocation.lon);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(userLocation.lat))*Math.cos(toRad(loc.lat))*Math.sin(dLon/2)**2;
    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
  }

  const sorted = useMemo(() => {
    if (sort !== "distance") return grouped;
    return [...grouped].sort((a, b) => {
      const da = distanceFor(a.masterId);
      const db = distanceFor(b.masterId);
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db;
    });
  }, [grouped, sort, JSON.stringify(ownersLocations), userLocation ? `${userLocation.lat},${userLocation.lon}` : ""]);

  if (view === "list") {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {sorted.map((g) => renderCard(g))}
      </div>
    );
  }
  // grid
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
      {sorted.map((g) => renderCard(g))}
    </div>
  );
}


