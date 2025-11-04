import { NextResponse } from "next/server";
import { fetchBackend } from "../_lib/proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user_type = searchParams.get("user_type") || null; // e.g., SALON
  const city = searchParams.get("city") || null; // e.g., Kyiv
  const skip = searchParams.get("skip") || "0";
  const limit = searchParams.get("limit") || "2000";
  const res = await fetchBackend(`/users?skip=${encodeURIComponent(skip)}&limit=${encodeURIComponent(limit)}`);
  const data = await res.json().catch(() => []);
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  let items = Array.isArray(data) ? data : (data.items || []);
  if (user_type) items = items.filter((u) => String(u.user_type).toUpperCase() === String(user_type).toUpperCase());
  if (city) items = items.filter((u) => (u.city || "").toLowerCase() === city.toLowerCase());
  return NextResponse.json({ items, total: items.length, skip: Number(skip), limit: Number(limit) });
}


