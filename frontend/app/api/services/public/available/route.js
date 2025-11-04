import { NextResponse } from "next/server";
import { fetchBackend } from "../../../_lib/proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const q = searchParams.get("q");
  const qs = new URLSearchParams({ city: city || "Kyiv", start_date: start || "", end_date: end || "" });
  if (q) qs.set("q", q);
  const res = await fetchBackend(`/services/public/available?${qs.toString()}`);
  const data = await res.json().catch(() => ({ service_ids: [] }));
  return NextResponse.json(data, { status: res.status });
}


