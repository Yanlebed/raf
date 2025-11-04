"use client";

import { useEffect, useMemo, useRef } from "react";

export default function MastersMap({ masters = {}, userLocation = null, height = 560 }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const markers = useMemo(() => {
    const out = [];
    for (const [id, loc] of Object.entries(masters || {})) {
      if (loc && typeof loc.lat === "number" && typeof loc.lon === "number") out.push({ id: Number(id), lat: loc.lat, lon: loc.lon });
    }
    return out;
  }, [masters]);

  useEffect(() => {
    let map;
    let L;
    let cleanups = [];
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;
      L = leaflet.default || leaflet;
      if (!containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
      cleanups.push(() => map && map.remove());
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains: "abcd",
      }).addTo(map);

      const points = [];
      if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lon === "number") {
        const u = L.circleMarker([userLocation.lat, userLocation.lon], { radius: 7, color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.9 }).addTo(map);
        points.push([userLocation.lat, userLocation.lon]);
        cleanups.push(() => u.remove());
      }
      for (const m of markers) {
        const mk = L.circleMarker([m.lat, m.lon], { radius: 6, color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.85 }).addTo(map);
        points.push([m.lat, m.lon]);
        cleanups.push(() => mk.remove());
      }
      if (points.length > 0) {
        const group = L.featureGroup(points.map(([a, b]) => L.marker([a, b])));
        map.fitBounds(group.getBounds().pad(0.2));
      } else {
        map.setView([50.4501, 30.5234], 11); // Kyiv default
      }
    })();
    return () => { cancelled = true; for (const c of cleanups) try { c(); } catch {} };
  }, [JSON.stringify(markers), userLocation ? `${userLocation.lat},${userLocation.lon}` : ""]);

  return (
    <div style={{ position: "sticky", top: 12 }}>
      <div ref={containerRef} style={{ width: "100%", height, borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }} />
    </div>
  );
}


