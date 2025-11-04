"use client";

import { useState } from "react";

export default function ContactPage() {
  const [payload, setPayload] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("Дякуємо! Ми відповімо найближчим часом.");
        setPayload({ name: "", phone: "", message: "" });
      } else {
        setStatus("Сталася помилка. Спробуйте пізніше.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ maxWidth: 720 }}>
      <h1 className="hero-title">Зв'язатися з нами</h1>
      <p className="hero-subtitle">Ми на зв'язку щодня з 08:00 до 21:00.</p>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "#fff" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div><span className="muted">Телефон:</span> 067 123 45 67</div>
            <div><span className="muted">Email:</span> <a className="nav-link" href="mailto:info@raf.ua">info@raf.ua</a></div>
            <div><span className="muted">Графік підтримки:</span> 08:00 – 21:00</div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Надіслати повідомлення</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Ім'я</div>
              <input value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} required style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Телефон</div>
              <input value={payload.phone} onChange={(e) => setPayload({ ...payload, phone: e.target.value })} required style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Повідомлення</div>
              <textarea value={payload.message} onChange={(e) => setPayload({ ...payload, message: e.target.value })} rows={4} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
            </label>
            {status ? <div className="muted">{status}</div> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="button" type="submit" disabled={submitting}>{submitting ? "Надсилаємо…" : "Відправити"}</button>
              <a className="nav-link" href="/" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>На головну</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}



