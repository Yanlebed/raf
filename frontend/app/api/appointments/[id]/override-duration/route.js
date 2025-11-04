import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../../../_lib/proxy";

export async function POST(request, { params }) {
  const body = await request.json();
  const res = await fetchWithAutoRefresh(request, `/appointments/${params.id}/override-duration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


