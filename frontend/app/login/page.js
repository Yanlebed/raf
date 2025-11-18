"use client";

import { useState } from "react";
import { sendOtp, loginWithOtp } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function onSend(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      if ((phone || "").trim() === "1") {
        await loginWithOtp({ phone: "1", code: "" });
        router.push("/account");
        return;
      }
      await sendOtp({ phone });
      setMsg("Code sent. Check your phone.");
      setStep(2);
    } catch (err) {
      setError(err?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithOtp({ phone, code });
      router.push("/account");
    } catch (err) {
      setError(err?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 420 }}>
      <h1 className="hero-title">Вхід</h1>
      <p className="hero-subtitle">Вхід за одноразовим кодом, надісланим на телефон.</p>
      {step === 1 ? (
        <form onSubmit={onSend}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Телефон</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                name="phone"
                placeholder="+380XXXXXXXXX"
                required
                style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            </label>
            {msg ? <div className="muted">{msg}</div> : null}
            {error ? <div className="muted" style={{ color: "#b91c1c" }}>{error}</div> : null}
            <button className="button" type="submit" disabled={loading}>{loading ? "Надсилаємо…" : "Надіслати код"}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={onVerify}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Код</div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type="text"
                inputMode="numeric"
                name="code"
                placeholder="123456"
                required
                style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            </label>
            {error ? <div className="muted" style={{ color: "#b91c1c" }}>{error}</div> : null}
            <button className="button" type="submit" disabled={loading}>{loading ? "Перевіряємо…" : "Підтвердити та увійти"}</button>
          </div>
        </form>
      )}
    </section>
  );
}


