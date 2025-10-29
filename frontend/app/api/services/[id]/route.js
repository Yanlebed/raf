import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../../_lib/proxy";

export async function PUT(request, { params }) {
  const body = await request.json();
  const id = params.id;
  const res = await fetchWithAutoRefresh(request, `/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request, { params }) {
  const id = params.id;
  const res = await fetchWithAutoRefresh(request, `/services/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


