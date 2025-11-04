import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function GET(_request, { params }) {
  const id = params?.id;
  if (!id) return NextResponse.json({ detail: "Missing id" }, { status: 400 });
  const res = await fetchBackend(`/users/get_user_by_id?user_id=${encodeURIComponent(id)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}


