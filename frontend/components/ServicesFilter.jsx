"use client";

import { useEffect, useRef, useState } from "react";
import DateRangePicker from "./DateRangePicker";

export default function ServicesFilter({ initialQ = "", initialCity = "", initialStart = "", initialEnd = "", initialLimit = 12 }) {
  const [city, setCity] = useState(initialCity);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const formRef = useRef(null);
  function submitNow() {
    try { formRef.current?.requestSubmit?.(); } catch { formRef.current?.submit?.(); }
  }
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
    <form method="GET" ref={formRef} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
      <input
        name="q"
        defaultValue={initialQ}
        placeholder="Пошук"
        onBlur={submitNow}
        style={{ flex: 1, minWidth: 220, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
      />
      <input type="hidden" name="start" value={start || ""} readOnly />
      <input type="hidden" name="end" value={end || ""} readOnly />
      <DateRangePicker
        initialStart={start}
        initialEnd={end}
        onChange={(s, e) => { setStart(s); setEnd(e); submitNow(); }}
      />
      {/* Auto-submit on change; no explicit button */}
    </form>
  );
}


