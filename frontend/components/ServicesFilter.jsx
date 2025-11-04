"use client";

import { useEffect, useState } from "react";

export default function ServicesFilter({ initialQ = "", initialCity = "", initialStart = "", initialEnd = "", initialLimit = 12 }) {
  const [city, setCity] = useState(initialCity);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  useEffect(() => {
    if (!initialCity && typeof window !== "undefined") {
      const saved = window.localStorage.getItem("city");
      if (saved) setCity(saved);
    }
  }, [initialCity]);

  useEffect(() => {
    if (typeof window !== "undefined" && city) {
      try { window.localStorage.setItem("city", city); } catch {}
    }
  }, [city]);

  useEffect(() => {
    if ((start && end) || typeof window === "undefined") return;
    const today = new Date();
    const week = new Date();
    week.setDate(today.getDate() + 7);
    const toISO = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
    if (!initialStart) setStart(toISO(today));
    if (!initialEnd) setEnd(toISO(week));
  }, [initialStart, initialEnd, start, end]);

  return (
    <form method="GET" style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
      <input
        name="q"
        defaultValue={initialQ}
        placeholder="Пошук"
        style={{ flex: 1, minWidth: 220, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
      />
      <input
        name="city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Місто"
        style={{ width: 160, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
      />
      <input
        name="start"
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        style={{ width: 160, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
        title="Дата від"
      />
      <input
        name="end"
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        style={{ width: 160, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
        title="Дата до"
      />
      <input
        name="limit"
        defaultValue={String(initialLimit)}
        type="number"
        min={1}
        max={50}
        style={{ width: 90, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
        title="К-сть на сторінці"
      />
      <button className="button" type="submit">Фільтрувати</button>
    </form>
  );
}


