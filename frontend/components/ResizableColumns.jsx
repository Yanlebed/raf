"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ResizableColumns({
  initialLeftWidth = 280,
  minLeftWidth = 200,
  maxLeftWidth = 480,
  rightFixedWidth = 360,
  gap = 12,
  left,
  middle,
  right,
}) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef(initialLeftWidth);

  const onMouseDown = useCallback((e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWRef.current = leftWidth;
    e.preventDefault();
  }, [leftWidth]);

  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      const next = Math.min(maxLeftWidth, Math.max(minLeftWidth, startWRef.current + dx));
      setLeftWidth(next);
    }
    function onUp() {
      draggingRef.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [minLeftWidth, maxLeftWidth]);

  const hasRight = right != null;
  const gridTemplateColumns = hasRight
    ? `${Math.round(leftWidth)}px 6px minmax(0, 1fr) ${rightFixedWidth}px`
    : `${Math.round(leftWidth)}px 6px minmax(0, 1fr)`;

  return (
    <div style={{ display: "grid", gridTemplateColumns, alignItems: "start", gap, width: "100%", boxSizing: "border-box" }}>
      <div style={{ minWidth: minLeftWidth }}>{left}</div>
      <div
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Змінити ширину фільтрів"
        tabIndex={0}
        style={{ cursor: "col-resize", height: "100%", background: "transparent", position: "relative" }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)" }} />
      </div>
      <div>{middle}</div>
      {hasRight ? <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>{right}</div> : null}
    </div>
  );
}


