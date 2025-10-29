"use client";

import { useState } from "react";
import { sendOtp, loginWithOtp } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function OtpLoginPage() {
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
      <h1 className="hero-title">Login via OTP</h1>
      <p className="hero-subtitle">Enter your phone number to receive a one-time code.</p>
      {step === 1 ? (
        <form onSubmit={onSend}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Phone</div>
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
            <button className="button" type="submit" disabled={loading}>{loading ? "Sending…" : "Send code"}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={onVerify}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <label>
              <div className="muted" style={{ marginBottom: 4 }}>Code</div>
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
            <button className="button" type="submit" disabled={loading}>{loading ? "Verifying…" : "Verify & Sign in"}</button>
          </div>
        </form>
      )}
    </section>
  );
}


