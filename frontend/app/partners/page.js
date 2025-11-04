"use client";

import { useState } from "react";

export default function PartnersPage() {
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
        setStatus("Дякуємо! Ми з вами зв'яжемось протягом 24 годин.");
        setPayload({ name: "", phone: "", message: "" });
      } else {
        setStatus("Сталася помилка. Спробуйте знову пізніше.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ maxWidth: 720 }}>
      <h1 className="hero-title">Партнерам</h1>
      <p className="hero-subtitle">Станьте частиною RAF: отримуйте нових клієнтів та керуйте записами онлайн.</p>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 700 }}>Більше клієнтів</div>
            <div className="muted" style={{ marginTop: 6 }}>Отримуйте нові записи від клієнтів, які шукають ваші послуги.</div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 700 }}>Зручний календар</div>
            <div className="muted" style={{ marginTop: 6 }}>Керуйте розкладом та підтверджуйте записи у кілька кліків.</div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 700 }}>Оплати та відгуки</div>
            <div className="muted" style={{ marginTop: 6 }}>Приймайте онлайн-оплати та отримуйте прозорі відгуки.</div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Залишити заявку</h3>
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



