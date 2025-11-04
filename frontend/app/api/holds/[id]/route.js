import { NextResponse } from "next/server";
import { fetchWithAutoRefresh } from "../../_lib/proxy";

export async function DELETE(request, { params }) {
  const id = params.id;
  const res = await fetchWithAutoRefresh(request, `/holds/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


