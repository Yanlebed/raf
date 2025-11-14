import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";
import { setTokenCookies } from "../../_lib/backend";

export async function POST(request) {
  const body = await request.json();
  // Dev bypass: if phone is "1", perform dev-login on backend and set cookies
  if (body?.phone === "1") {
    const devRes = await fetchBackend("/login/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "1" }),
    });
    const devData = await devRes.json().catch(() => ({}));
    if (!devRes.ok) return NextResponse.json(devData || { detail: "Failed" }, { status: devRes.status });
    const next = NextResponse.json({ ok: true });
    setTokenCookies(next, { accessToken: devData.access_token, refreshToken: devData.refresh_token });
    return next;
  }
  const res = await fetchBackend("/login/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data || { detail: "Failed" }, { status: res.status });
  const nextRes = NextResponse.json({ ok: true });
  setTokenCookies(nextRes, { accessToken: data.access_token, refreshToken: data.refresh_token });
  return nextRes;
}


