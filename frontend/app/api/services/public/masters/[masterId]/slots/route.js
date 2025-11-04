import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../_lib/proxy";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const duration = searchParams.get("duration_minutes");
  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  if (duration) qs.set("duration_minutes", duration);
  const res = await fetchBackend(`/services/public/masters/${params.masterId}/slots?${qs.toString()}`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}


