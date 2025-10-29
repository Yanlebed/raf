import { NextResponse } from "next/server";
import { getBackendBase, clearTokenCookies } from "../../_lib/backend";

export async function POST(request) {
  const base = getBackendBase();
  const refresh = request.cookies.get("refresh_token")?.value;
  if (refresh) {
    await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh, all_devices: true }),
    }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  clearTokenCookies(res);
  return res;
}


