const DEFAULT_BASE = "http://localhost:8000/api/v1";

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

export function parseApiError(data, fallbackMessage = "Request failed") {
  if (!data) {
    return { message: fallbackMessage, code: undefined, fieldErrors: undefined };
  }
  if (typeof data === "string") {
    return { message: data || fallbackMessage, code: undefined, fieldErrors: undefined };
  }
  const detail = data.detail;
  let code;
  let fieldErrors;
  let message = fallbackMessage;

  if (detail) {
    if (typeof detail === "string") {
      message = detail;
    } else {
      code = detail.code;
      message = detail.message || fallbackMessage;
      if (Array.isArray(detail.field_errors)) {
        fieldErrors = detail.field_errors;
        const first = detail.field_errors[0];
        if (first && first.message) {
          message = first.message;
        }
      }
    }
  } else if (data.message) {
    message = data.message;
  }

  return { message: message || fallbackMessage, code, fieldErrors };
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
    const { message, code, fieldErrors } = parseApiError(data, res.statusText || "Request failed");
    const err = new Error(message);
    err.status = res.status;
    err.code = code;
    err.data = data;
    if (fieldErrors) err.fieldErrors = fieldErrors;
    throw err;
  }
  return data;
}


