"use client";

import { useEffect, useMemo, useState } from "react";

export default function MasterServicesAndSlots({ masterId, services, defaultDateISO }) {
  const [openCat, setOpenCat] = useState(null);
  const byCategory = useMemo(() => {
    const map = new Map();
    for (const s of services || []) {
      const key = s.category || "Інше";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return Array.from(map.entries());
  }, [services]);

  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const selectedServices = useMemo(() => (services || []).filter((s) => selectedServiceIds.includes(s.id)), [services, selectedServiceIds]);
  const totalDuration = useMemo(() => selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0), [selectedServices]);
  const [date, setDate] = useState(() => (defaultDateISO || new Date().toISOString().slice(0,10)));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    async function load() {
      if (!date || selectedServiceIds.length === 0) { setSlots([]); return; }
      setLoadingSlots(true);
      try {
        const dur = Math.max(0, totalDuration || 0);
        const qs = new URLSearchParams({ date });
        if (dur) qs.set("duration_minutes", String(dur));
        const res = await fetch(`/api/services/public/masters/${masterId}/slots?${qs.toString()}`, { cache: "no-store" });
        const list = res.ok ? await res.json() : [];
        setSlots(Array.isArray(list) ? list : []);
      } finally {
        setLoadingSlots(false);
      }
    }
    load();
  }, [date, masterId, totalDuration, JSON.stringify(selectedServiceIds)]);

  function toggleService(id) {
    setSelectedServiceIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h3 style={{ margin: 0 }}>Послуги майстра</h3>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {byCategory.map(([cat, list]) => (
            <details key={cat} open={openCat === cat} onToggle={(e) => { if (e.target.open) setOpenCat(cat); }} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8, background: "#fff" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>{cat}</summary>
              <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                {list.map((s) => (
                  <label key={s.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={selectedServiceIds.includes(s.id)} onChange={() => toggleService(s.id)} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.description || ""}</div>
                    </div>
                    <div style={{ display: "grid", gap: 2, justifyItems: "end" }}>
                      {typeof s.price === "number" ? <div>₴ {Math.round(s.price)}</div> : <div>₴ —</div>}
                      <div className="muted" style={{ fontSize: 12 }}>{(s.duration || 30)} хв</div>
                    </div>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Доступні години</h3>
        <div className="muted" style={{ fontSize: 13 }}>
          {selectedServiceIds.length === 0 ? "Оберіть хоча б одну послугу" : totalDuration ? `Загальна тривалість: ${totalDuration} хв` : null}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" lang="uk" value={date} onChange={(e) => setDate(e.target.value)} style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }} />
        </div>
        {loadingSlots ? (
          <div className="muted">Завантаження слотів…</div>
        ) : slots.length === 0 ? (
          <div className="muted">Немає доступних слотів на цю дату.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {slots.map((iso) => {
              const d = new Date(iso);
              const label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <span key={iso} className="nav-link" style={{ border: "1px solid var(--border)", borderRadius: 6, height: 32, padding: "0 8px", display: "inline-flex", alignItems: "center" }}>{label}</span>
              );
            })}
          </div>
        )}
        {selectedServiceIds.length > 0 ? (
          <div className="muted" style={{ fontSize: 12 }}>Підсумкова тривалість: {totalDuration} хв.</div>
        ) : null}
      </div>
    </div>
  );
}


