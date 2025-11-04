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

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  const res = await fetchWithAutoRefresh(request, "/users/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


