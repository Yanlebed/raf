import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../_lib/proxy";

export async function GET(_request, { params }) {
  const res = await fetchBackend(`/services/public/${params.id}/masters`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}


