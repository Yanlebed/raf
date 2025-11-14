import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function POST(request) {
  const body = await request.json();
  const res = await fetchBackend("/login/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data || { detail: "Failed" }, { status: res.status });
  return NextResponse.json(data);
}


