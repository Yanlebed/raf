"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAllDevices } from "../lib/auth";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", message: "" });
  const [leadMsg, setLeadMsg] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((me) => {
        if (cancelled) return;
        if (me) {
          setLoggedIn(true);
          setIsAdmin(me.user_type === "ADMIN");
          setIsMaster(me.user_type === "MASTER");
        } else {
          setLoggedIn(false);
          setIsAdmin(false);
          setIsMaster(false);
        }
      })
      .catch(() => { if (!cancelled) setLoggedIn(false); });
    return () => { cancelled = true; };
  }, []);

  // Persisted city selection and geolocation stub
  const [city, setCity] = useState("Kyiv");
  const [cities, setCities] = useState(["Kyiv", "Lviv", "Odesa"]);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("city") : null;
    if (saved) setCity(saved);
    fetch("/api/locations/cities").then(async (r) => (r.ok ? r.json() : [])).then((list) => {
      if (Array.isArray(list) && list.length) setCities(list);
    }).catch(() => {});
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: false, timeout: 1500 }
      );
    }
  }, []);

  function onCityChange(e) {
    const value = e.target.value;
    setCity(value);
    if (typeof window !== "undefined") window.localStorage.setItem("city", value);
    // route to services with city filter
    window.location.href = `/services?city=${encodeURIComponent(value)}`;
  }

  async function handleLogout() {
    await logoutAllDevices();
    setLoggedIn(false);
  }

  return (
    <>
    <nav className="nav" style={{ gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 240 }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <Link href="/" className="brand">
            <span className="brand-badge" />
            RAF
          </Link>
          <div className="muted" style={{ marginTop: 2 }}>Платформа б'юті послуг</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <select value={city} onChange={onCityChange} style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
          {cities.map((c) => {
            const uaMap = {
              Kyiv: "м. Київ",
              Lviv: "м. Львів",
              Kharkiv: "м. Харків",
              Dnipro: "м. Дніпро",
              Odesa: "м. Одеса",
              Zaporizhzhia: "м. Запоріжжя",
              Vinnytsia: "м. Вінниця",
              Zhytomyr: "м. Житомир",
              Chernihiv: "м. Чернігів",
              Sumy: "м. Суми",
              Poltava: "м. Полтава",
              Cherkasy: "м. Черкаси",
              Kropyvnytskyi: "м. Кропивницький",
              Mykolaiv: "м. Миколаїв",
              Kherson: "м. Херсон",
              "Ivano-Frankivsk": "м. Івано-Франківськ",
              Ternopil: "м. Тернопіль",
              Lutsk: "м. Луцьк",
              Uzhhorod: "м. Ужгород",
              Rivne: "м. Рівне",
              Chernivtsi: "м. Чернівці",
            };
            const ua = uaMap[c] || c;
            return <option key={c} value={c}>{ua}</option>;
          })}
        </select>
      </div>

      <div className="nav-links" style={{ alignItems: "center", gap: 12 }}>
        <select defaultValue="Українська" style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
          <option>Українська</option>
        </select>
        <Link href={loggedIn ? "/account" : "/login"} className="nav-link" aria-label="Профіль" title="Профіль">
          <span aria-hidden style={{ display: "inline-flex", width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        </Link>
        <Link href="/services" className="nav-link" aria-label="Категорії" title="Категорії">
          <span aria-hidden style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 4, border: "1px solid var(--border)", borderRadius: 6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="3" y="3" width="4.5" height="4.5" rx="0.8" />
              <rect x="9.75" y="3" width="4.5" height="4.5" rx="0.8" />
              <rect x="16.5" y="3" width="4.5" height="4.5" rx="0.8" />
              <rect x="3" y="9.75" width="4.5" height="4.5" rx="0.8" />
              <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="0.8" />
              <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="0.8" />
              <rect x="3" y="16.5" width="4.5" height="4.5" rx="0.8" />
              <rect x="9.75" y="16.5" width="4.5" height="4.5" rx="0.8" />
              <rect x="16.5" y="16.5" width="4.5" height="4.5" rx="0.8" />
            </svg>
          </span>
        </Link>
      </div>
    </nav>
    
    </>
  );
}


