import { NextResponse } from "next/server";
import { fetchBackend } from "../../_lib/proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Kyiv";
  const q = searchParams.get("q") ?? null;
  const skip = searchParams.get("skip") ?? "0";
  const limit = searchParams.get("limit") ?? "20";
  const start = searchParams.get("start") ?? null;
  const end = searchParams.get("end") ?? null;
  const price_min = searchParams.get("price_min");
  const price_max = searchParams.get("price_max");
  const rating_min = searchParams.get("rating_min");
  const accept_home = searchParams.get("accept_home");
  const at_salon = searchParams.get("at_salon");
  const own_premises = searchParams.get("own_premises");
  const visiting_client = searchParams.get("visiting_client");
  const user_lat = searchParams.get("user_lat");
  const user_lon = searchParams.get("user_lon");
  const max_distance_km = searchParams.get("max_distance_km");
  const sort = searchParams.get("sort");
  const qs = new URLSearchParams({ city, skip, limit });
  if (q) qs.set("q", q);
  if (start) qs.set("start_date", start);
  if (end) qs.set("end_date", end);
  if (price_min) qs.set("price_min", price_min);
  if (price_max) qs.set("price_max", price_max);
  if (rating_min) qs.set("rating_min", rating_min);
  if (accept_home) qs.set("accept_home", accept_home);
  if (at_salon) qs.set("at_salon", at_salon);
  if (own_premises) qs.set("own_premises", own_premises);
  if (visiting_client) qs.set("visiting_client", visiting_client);
  if (user_lat) qs.set("user_lat", user_lat);
  if (user_lon) qs.set("user_lon", user_lon);
  if (max_distance_km) qs.set("max_distance_km", max_distance_km);
  if (sort) qs.set("sort", sort);
  const res = await fetchBackend(`/services/public?${qs.toString()}`);
  const data = await res.json().catch(() => ({ items: [] }));
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}


