import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../_lib/proxy";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const res = await fetchBackend(`/services/public/${params.id}/masters/${params.masterId}/slots?date=${encodeURIComponent(date || "")}`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}


