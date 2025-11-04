import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const masterId = searchParams.get("master_id");
  const salonId = searchParams.get("salon_id");
  if (!masterId && !salonId) {
    return NextResponse.json({ detail: "Missing master_id or salon_id" }, { status: 400 });
  }
  const qs = new URLSearchParams();
  if (masterId) qs.set("master_id", masterId);
  if (salonId) qs.set("salon_id", salonId);
  // Fetch a sufficiently large page to compute aggregates; backend requires auth for reviews
  qs.set("skip", "0");
  qs.set("limit", "2000");
  qs.set("order", "desc");
  const res = await fetchBackend(`/reviews/?${qs.toString()}`);
  const data = await res.json().catch(() => ({ items: [] }));
  if (!res.ok) {
    return NextResponse.json({ avg: null, count: 0 }, { status: res.status });
  }
  const items = Array.isArray(data?.items) ? data.items : [];
  const count = items.length;
  const avg = count ? items.reduce((s, r) => s + (Number(r?.rating) || 0), 0) / count : null;
  return NextResponse.json({ avg: avg != null ? Number(avg.toFixed(2)) : null, count });
}



