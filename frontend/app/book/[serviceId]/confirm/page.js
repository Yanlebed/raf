"use client";

import { useEffect, useState } from "react";
import { createAppointment, releaseHold } from "../../../../lib/booking";
import { useRouter, useSearchParams } from "next/navigation";

async function fetchService(id) {
  const res = await fetch(`/api/services/public/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default function ConfirmBookingPage({ params }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { serviceId } = params;
  const holdId = sp.get("hold_id");
  const startIso = sp.get("start");
  const [service, setService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchService(serviceId).then((s) => {
      if (mounted) setService(s);
    });
    return () => { mounted = false; };
  }, [serviceId]);

  async function onConfirm() {
    if (!service || !startIso) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        master_id: service.owner_user_id,
        client_id: 0, // ignored by backend, set from auth
        service_id: service.id,
        appointment_date: new Date(startIso).toISOString(),
        price: service.price ?? null,
      };
      const appt = await createAppointment(payload);
      // best-effort release of hold (if backend auto-expires, harmless)
      if (holdId) releaseHold(holdId);
      router.push(`/book/success?id=${appt.id}`);
    } catch (err) {
      setError(err?.message || "Failed to create appointment");
      setSubmitting(false);
    }
  }

  if (!startIso) return <div style={{ color: "#b91c1c" }}>Missing start time.</div>;
  if (!service) return <div>Loading…</div>;

  const start = new Date(startIso);

  return (
    <section style={{ maxWidth: 520 }}>
      <h1 className="hero-title">Confirm booking</h1>
      <p className="hero-subtitle">Please review and confirm your appointment.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <div><span className="muted">Service:</span> {service.name}</div>
        <div><span className="muted">When:</span> {start.toLocaleString()}</div>
        {typeof service.price === "number" ? <div><span className="muted">Price:</span> {service.price}</div> : null}
        {typeof service.duration === "number" ? <div><span className="muted">Duration:</span> {service.duration} min</div> : null}
      </div>
      {error ? <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div> : null}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="button" onClick={onConfirm} disabled={submitting}>{submitting ? "Booking…" : "Confirm"}</button>
        <a className="nav-link" href={`/book/${service.id}`} style={{ display: "inline-flex", alignItems: "center", height: 40 }}>Back</a>
      </div>
    </section>
  );
}


