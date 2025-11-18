"use client";

import { useEffect, useState } from "react";

export default function AnchorTabs({ items = [] }) {
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  useEffect(() => {
    function onHashChange() { setHash(window.location.hash); }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((it) => {
        const active = hash === it.href;
        return (
          <a key={it.href} href={it.href} className="nav-link" style={{ border: "1px solid var(--border)", borderRadius: 6, height: 34, padding: "0 10px", background: active ? "var(--accent)" : "#fff", color: active ? "#fff" : "inherit" }}>{it.label}</a>
        );
      })}
    </div>
  );
}


