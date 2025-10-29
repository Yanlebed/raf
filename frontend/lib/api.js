const DEFAULT_BASE = "http://localhost:8000/api/v1";

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  // Attach access token if present
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText;
    const err = new Error(message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}


