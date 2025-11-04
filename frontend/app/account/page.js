"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "../../lib/auth";

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMe();
        if (mounted) setMe(data);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Завантаження…</div>;
  if (error) return <div style={{ color: "#b91c1c" }}>{error}</div>;

  return (
    <section>
      <h1 className="hero-title">Мій профіль</h1>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div><span className="muted">ID:</span> {me?.id}</div>
        <div><span className="muted">Телефон:</span> {me?.phone || "—"}</div>
        <div><span className="muted">Email:</span> {me?.email || "—"}</div>
        <div><span className="muted">Ім'я:</span> {me?.name || "—"}</div>
      </div>
    </section>
  );
}


