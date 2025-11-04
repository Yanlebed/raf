import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../../../_lib/proxy";

export async function GET(request, { params }) {
  const res = await fetchWithAutoRefresh(request, `/schedules/masters/${params.masterId}`, { headers: {} });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const { day_of_week, start_time, end_time } = await request.json();
  const qs = new URLSearchParams({ day_of_week: String(day_of_week), start_time, end_time });
  const res = await fetchWithAutoRefresh(request, `/schedules/masters/${params.masterId}?${qs.toString()}`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


