import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../_lib/proxy";

export async function POST(request) {
  const body = await request.json();
  const res = await fetchWithAutoRefresh(request, "/holds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


