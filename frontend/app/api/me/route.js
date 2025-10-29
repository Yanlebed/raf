import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../_lib/proxy";

export async function GET(request) {
  // Try to fetch /users/me, auto-refresh if needed
  const res = await fetchWithAutoRefresh(request, "/users/me", { headers: {} });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data || { detail: "Unauthorized" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}


