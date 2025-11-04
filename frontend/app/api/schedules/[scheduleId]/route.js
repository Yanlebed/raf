import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../../_lib/proxy";

export async function PUT(request, { params }) {
  const { day_of_week, start_time, end_time } = await request.json();
  const qs = new URLSearchParams();
  if (day_of_week !== undefined) qs.set("day_of_week", String(day_of_week));
  if (start_time) qs.set("start_time", start_time);
  if (end_time) qs.set("end_time", end_time);
  const res = await fetchWithAutoRefresh(request, `/schedules/${params.scheduleId}?${qs.toString()}`, { method: "PUT" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request, { params }) {
  const res = await fetchWithAutoRefresh(request, `/schedules/${params.scheduleId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


