"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function parseISO(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(target, a, b) {
  if (!a || !b) return false;
  const t = target.setHours(0,0,0,0);
  const aa = a.setHours(0,0,0,0);
  const bb = b.setHours(0,0,0,0);
  const [min, max] = aa <= bb ? [aa, bb] : [bb, aa];
  return t > min && t < max;
}

export default function DateRangePicker({ initialStart = "", initialEnd = "", onChange }) {
  const [open, setOpen] = useState(false);
  const startDate = useMemo(() => parseISO(initialStart), [initialStart]);
  const endDate = useMemo(() => parseISO(initialEnd), [initialEnd]);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(startDate || new Date()));
  const containerRef = useRef(null);

  useEffect(() => { setDraftStart(startDate); }, [startDate?.getTime?.()]);
  useEffect(() => { setDraftEnd(endDate); }, [endDate?.getTime?.()]);

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function selectDay(day) {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(day);
      setDraftEnd(null);
    } else if (draftStart && !draftEnd) {
      if (day < draftStart) {
        setDraftEnd(draftStart);
        setDraftStart(day);
      } else if (isSameDay(day, draftStart)) {
        // single-day range
        setDraftEnd(day);
        if (onChange) onChange(toISO(day), toISO(day));
        setOpen(false);
      } else {
        setDraftEnd(day);
        if (onChange) onChange(toISO(draftStart), toISO(day));
        setOpen(false);
      }
    }
  }

  function renderMonth(monthStart) {
    const month = monthStart.getMonth();
    const year = monthStart.getFullYear();
    const firstWeekday = (new Date(year, month, 1)).getDay(); // 0=Sun..6=Sat
    const offset = (firstWeekday === 0 ? 6 : firstWeekday - 1); // Mon-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return (
      <div style={{ width: 236 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
          {[
            "Пн","Вт","Ср","Чт","Пт","Сб","Нд"
          ].map((wd) => <div key={wd} style={{ textAlign: "center" }}>{wd}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {weeks.flat().map((d, idx) => {
            if (!d) return <div key={idx} />;
            const isStart = draftStart && isSameDay(d, draftStart);
            const isEnd = draftEnd && isSameDay(d, draftEnd);
            const inRange = draftStart && draftEnd && isBetween(new Date(d), new Date(draftStart), new Date(draftEnd));
            const selected = isStart || isEnd;
            const bg = selected ? "var(--accent)" : inRange ? "#e6f4ef" : "#fff";
            const color = selected ? "#fff" : "inherit";
            return (
              <button
                key={idx}
                type="button"
                onClick={() => selectDay(new Date(d))}
                style={{ height: 32, borderRadius: 6, border: "1px solid var(--border)", background: bg, color, cursor: "pointer" }}
                aria-label={d.toLocaleDateString("uk-UA")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const label = useMemo(() => {
    if (startDate && endDate) {
      const a = startDate.toLocaleDateString("uk-UA");
      const b = endDate.toLocaleDateString("uk-UA");
      return `${a} — ${b}`;
    }
    return "Виберіть дати";
  }, [startDate?.getTime?.(), endDate?.getTime?.()]);

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <button type="button" className="nav-link" onClick={() => setOpen((v) => !v)} style={{ height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
        📅 <span className="muted" style={{ marginLeft: 6 }}>{label}</span>
      </button>
      {open ? (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button type="button" className="nav-link" onClick={() => setVisibleMonth((m) => addMonths(m, -1))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 28, padding: "0 8px" }}>‹</button>
            <div className="muted" style={{ fontWeight: 700 }}>{visibleMonth.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })}</div>
            <button type="button" className="nav-link" onClick={() => setVisibleMonth((m) => addMonths(m, 1))} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 28, padding: "0 8px" }}>›</button>
          </div>
          {renderMonth(visibleMonth)}
        </div>
      ) : null}
    </div>
  );
}


