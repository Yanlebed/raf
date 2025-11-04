"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CITY_COORDS = [
  { key: "Kyiv", label: "м. Київ", lat: 50.4501, lon: 30.5234 },
  { key: "Lviv", label: "м. Львів", lat: 49.8397, lon: 24.0297 },
  { key: "Odesa", label: "м. Одеса", lat: 46.4825, lon: 30.7233 },
  { key: "Kharkiv", label: "м. Харків", lat: 49.9935, lon: 36.2304 },
  { key: "Dnipro", label: "м. Дніпро", lat: 48.4647, lon: 35.0462 },
  { key: "Zaporizhzhia", label: "м. Запоріжжя", lat: 47.8388, lon: 35.1396 },
  { key: "Vinnytsia", label: "м. Вінниця", lat: 49.2328, lon: 28.48097 },
  { key: "Zhytomyr", label: "м. Житомир", lat: 50.2547, lon: 28.6587 },
  { key: "Chernihiv", label: "м. Чернігів", lat: 51.4982, lon: 31.2893 },
  { key: "Sumy", label: "м. Суми", lat: 50.9077, lon: 34.7981 },
  { key: "Poltava", label: "м. Полтава", lat: 49.5883, lon: 34.5514 },
  { key: "Cherkasy", label: "м. Черкаси", lat: 49.4444, lon: 32.0598 },
  { key: "Kropyvnytskyi", label: "м. Кропивницький", lat: 48.5079, lon: 32.2623 },
  { key: "Mykolaiv", label: "м. Миколаїв", lat: 46.9750, lon: 31.9946 },
  { key: "Kherson", label: "м. Херсон", lat: 46.6354, lon: 32.6169 },
  { key: "Ivano-Frankivsk", label: "м. Івано-Франківськ", lat: 48.9226, lon: 24.7111 },
  { key: "Ternopil", label: "м. Тернопіль", lat: 49.5535, lon: 25.5948 },
  { key: "Lutsk", label: "м. Луцьк", lat: 50.7472, lon: 25.3254 },
  { key: "Uzhhorod", label: "м. Ужгород", lat: 48.6208, lon: 22.2879 },
  { key: "Rivne", label: "м. Рівне", lat: 50.6199, lon: 26.2516 },
  { key: "Chernivtsi", label: "м. Чернівці", lat: 48.2921, lon: 25.9358 },
];

function findNearestCity(lat, lon) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  let best = null;
  for (const c of CITY_COORDS) {
    const dLat = toRad(c.lat - lat);
    const dLon = toRad(c.lon - lon);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(c.lat))*Math.sin(dLon/2)**2;
    const dist = 2 * Math.asin(Math.sqrt(a)) * R;
    if (!best || dist < best.dist) best = { city: c.key, dist };
  }
  return best?.city || null;
}

export default function SalonsCityControls({ initialCity }) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity || "Kyiv");

  // Redirect based on saved city or geolocation (only if current differs)
  useEffect(() => {
    let redirected = false;
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("city") : null;
      if (saved && saved !== initialCity) {
        redirected = true;
        router.replace(`/salons?city=${encodeURIComponent(saved)}`);
        return;
      }
    } catch {}
    if (!redirected && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const guessed = findNearestCity(pos.coords.latitude, pos.coords.longitude);
          if (guessed && guessed !== initialCity) {
            router.replace(`/salons?city=${encodeURIComponent(guessed)}`);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }
  }, [initialCity, router]);

  function onSubmit(e) {
    e.preventDefault();
    try { window.localStorage.setItem("city", city); } catch {}
    router.push(`/salons?city=${encodeURIComponent(city)}`);
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


