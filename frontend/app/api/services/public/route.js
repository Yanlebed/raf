import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Kyiv";
  const q = searchParams.get("q") ?? null;
  const skip = searchParams.get("skip") ?? "0";
  const limit = searchParams.get("limit") ?? "20";
  const qs = new URLSearchParams({ city, skip, limit });
  if (q) qs.set("q", q);
  const res = await fetchBackend(`/services/public?${qs.toString()}`);
  const data = await res.json().catch(() => ({ items: [] }));
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}


