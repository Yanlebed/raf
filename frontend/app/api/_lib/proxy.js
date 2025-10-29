import { NextResponse } from "next/server";
import { getBackendBase, setTokenCookies } from "./backend";

export async function fetchBackend(path, init = {}) {
  const base = getBackendBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  return fetch(url, init);
}

export async function fetchWithAuth(request, path, init = {}) {
  const access = request.cookies.get("access_token")?.value;
  const headers = new Headers(init.headers || {});
  if (access && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${access}`);
  }
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetchBackend(path, { ...init, headers });
  return res;
}

export async function fetchWithAutoRefresh(request, path, init = {}) {
  // attempt with current access token
  let res = await fetchWithAuth(request, path, init);
  if (res.status !== 401) return res;

  // try refresh
  const base = getBackendBase();
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) return res;
  const refreshRes = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!refreshRes.ok) return res;
  const tokens = await refreshRes.json();
  // issue new cookies and retry
  const nextRes = NextResponse.next();
  setTokenCookies(nextRes, { accessToken: tokens.access_token, refreshToken: tokens.refresh_token });

  // retry original request with new access token
  const retry = await fetch(`${getBackendBase()}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${tokens.access_token}`,
      ...(init.body && !new Headers(init.headers || {}).has("Content-Type") ? { "Content-Type": "application/json" } : {}),
    },
  });

  // Merge cookies into a final response
  const merged = new NextResponse(retry.body, {
    status: retry.status,
    headers: retry.headers,
  });
  // copy set-cookies from nextRes
  const setCookie = nextRes.headers.getSetCookie?.() || [];
  for (const c of setCookie) merged.headers.append("set-cookie", c);
  return merged;
}


