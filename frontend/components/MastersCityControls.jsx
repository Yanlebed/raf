"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CITY_COORDS = [
  { key: "Kyiv", label: "м. Київ" },
  { key: "Lviv", label: "м. Львів" },
  { key: "Odesa", label: "м. Одеса" },
  { key: "Kharkiv", label: "м. Харків" },
  { key: "Dnipro", label: "м. Дніпро" },
  { key: "Zaporizhzhia", label: "м. Запоріжжя" },
  { key: "Vinnytsia", label: "м. Вінниця" },
  { key: "Zhytomyr", label: "м. Житомир" },
  { key: "Chernihiv", label: "м. Чернігів" },
  { key: "Sumy", label: "м. Суми" },
  { key: "Poltava", label: "м. Полтава" },
  { key: "Cherkasy", label: "м. Черкаси" },
  { key: "Kropyvnytskyi", label: "м. Кропивницький" },
  { key: "Mykolaiv", label: "м. Миколаїв" },
  { key: "Kherson", label: "м. Херсон" },
  { key: "Ivano-Frankivsk", label: "м. Івано-Франківськ" },
  { key: "Ternopil", label: "м. Тернопіль" },
  { key: "Lutsk", label: "м. Луцьк" },
  { key: "Uzhhorod", label: "м. Ужгород" },
  { key: "Rivne", label: "м. Рівне" },
  { key: "Chernivtsi", label: "м. Чернівці" },
];

export default function MastersCityControls({ initialCity }) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity || "Kyiv");

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("city") : null;
      if (saved && saved !== initialCity) {
        router.replace(`/masters?city=${encodeURIComponent(saved)}`);
      }
    } catch {}
  }, [initialCity, router]);

  function onSubmit(e) {
    e.preventDefault();
    try { window.localStorage.setItem("city", city); } catch {}
    router.push(`/masters?city=${encodeURIComponent(city)}`);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
      <label className="muted" htmlFor="city-select">Місто:</label>
      <select id="city-select" value={city} onChange={(e) => setCity(e.target.value)} style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
        {CITY_COORDS.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>
      <button type="submit" className="button">Застосувати</button>
    </form>
  );
}



