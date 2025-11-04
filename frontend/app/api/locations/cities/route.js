import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function GET() {
  const res = await fetchBackend("/locations/cities");
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}


