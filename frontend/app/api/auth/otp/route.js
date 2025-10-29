import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";
import { setTokenCookies } from "../../_lib/backend";

export async function POST(request) {
  const body = await request.json();
  const res = await fetchBackend("/auth/otp", {
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


