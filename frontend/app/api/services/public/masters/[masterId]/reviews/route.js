import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../_lib/proxy";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const skip = searchParams.get("skip") || "0";
  const limit = searchParams.get("limit") || "10";
  const order = searchParams.get("order") || "desc";
  qs.set("skip", skip);
  qs.set("limit", limit);
  qs.set("order", order);
  const res = await fetchBackend(`/services/public/masters/${params.masterId}/reviews?${qs.toString()}`);
  const data = await res.json().catch(() => ({ items: [] }));
  return NextResponse.json(data, { status: res.status });
}


