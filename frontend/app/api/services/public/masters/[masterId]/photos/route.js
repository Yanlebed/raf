import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../_lib/proxy";

export async function GET(_request, { params }) {
  const res = await fetchBackend(`/services/public/masters/${params.masterId}/photos`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}


