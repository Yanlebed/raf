import { apiFetch } from "./api";

function setCookie(name, value, maxAgeSeconds) {
  if (typeof document === "undefined") return;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
  ];
  if (maxAgeSeconds) parts.push(`Max-Age=${maxAgeSeconds}`);
  document.cookie = parts.join("; ");
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

export async function loginWithPassword({ username, password }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "Login failed");
    err.status = res.status;
    throw err;
  }
  return { ok: true };
}

export async function fetchMe() {
  const res = await fetch("/api/me", { cache: "no-store" });
  if (!res.ok) {
    const err = new Error("Unauthorized");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function logoutAllDevices() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function sendOtp({ phone }) {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "Failed to send code");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function loginWithOtp({ phone, code }) {
  const res = await fetch("/api/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "OTP login failed");
    err.status = res.status;
    throw err;
  }
  return { ok: true };
}

export async function updateMe(payload) {
  const res = await fetch("/api/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "Failed to update profile");
    err.status = res.status;
    throw err;
  }
  return res.json();
}


