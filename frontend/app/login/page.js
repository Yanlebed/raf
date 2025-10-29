"use client";

import { useState } from "react";
import { loginWithPassword } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword({ username, password });
      router.push("/account");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 420 }}>
      <h1 className="hero-title">Login</h1>
      <p className="hero-subtitle">Enter your credentials to continue.</p>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label>
            <div className="muted" style={{ marginBottom: 4 }}>Username</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              required
              style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
            />
          </label>
          <label>
            <div className="muted" style={{ marginBottom: 4 }}>Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              required
              style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }}
            />
          </label>
          {error ? (
            <div className="muted" style={{ color: "#b91c1c" }}>{error}</div>
          ) : null}
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </section>
  );
}


