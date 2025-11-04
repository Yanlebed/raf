import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../_lib/proxy";

export async function GET(request) {
  const url = new URL(request.url);
  const search = url.search;
  const res = await fetchWithAutoRefresh(request, `/appointments${search || ""}`, { headers: {} });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request) {
  const body = await request.json();
  const res = await fetchWithAutoRefresh(request, "/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


