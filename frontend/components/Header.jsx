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
        <Link href="/" className="brand">
          <span className="brand-badge" />
          RAF
        </Link>
        <div className="muted" style={{ whiteSpace: "nowrap" }}>Платформа б'юті послуг</div>
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
          <span style={{ display: "inline-block", width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)" }} />
        </Link>
        <Link href="/services" className="nav-link" aria-label="Категорії" title="Категорії">
          <span style={{ display: "grid", gridTemplateColumns: "repeat(2, 8px)", gridAutoRows: "8px", gap: 3, padding: 4, border: "1px solid var(--border)", borderRadius: 6 }}>
            <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
            <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
            <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
            <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
          </span>
        </Link>
        <button className="button" onClick={() => { setLead({ name: "", phone: "", message: "" }); setLeadMsg(""); setShowLead(true); }}>Залишити заявку</button>
      </div>
    </nav>
    {showLead ? (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", width: "min(520px, 96vw)", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong>Залишити заявку</strong>
            <button className="nav-link" onClick={() => setShowLead(false)} style={{ border: 0, background: "transparent" }}>✕</button>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLeadMsg("");
            const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
            if (res.ok) { setLeadMsg("Дякуємо! Ми з вами зв'яжемось."); setLead({ name: "", phone: "", message: "" }); }
            else setLeadMsg("Сталася помилка. Спробуйте пізніше.");
          }} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Ім'я</div>
              <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} required style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Телефон</div>
              <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} required style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Повідомлення</div>
              <textarea value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} rows={4} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            {leadMsg ? <div className="muted">{leadMsg}</div> : null}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="nav-link" onClick={() => setShowLead(false)} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 40, padding: "0 12px" }}>Скасувати</button>
              <button className="button" type="submit">Відправити</button>
            </div>
          </form>
        </div>
      </div>
    ) : null}
    </>
  );
}


