import { apiFetch, parseApiError } from "./api";

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
    const { message, code } = parseApiError(data, "Login failed");
    const err = new Error(message);
    err.status = res.status;
    if (code) err.code = code;
    err.data = data;
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
    const { message, code } = parseApiError(data, "Failed to send code");
    const err = new Error(message);
    err.status = res.status;
    if (code) err.code = code;
    err.data = data;
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
    const { message, code } = parseApiError(data, "OTP login failed");
    const err = new Error(message);
    err.status = res.status;
    if (code) err.code = code;
    err.data = data;
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
    const { message, code } = parseApiError(data, "Failed to update profile");
    const err = new Error(message);
    err.status = res.status;
    if (code) err.code = code;
    err.data = data;
    throw err;
  }
  return res.json();
}


