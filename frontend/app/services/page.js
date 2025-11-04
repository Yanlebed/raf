import { getSiteOrigin } from "../../lib/site";
import ServicesFilter from "../../components/ServicesFilter";
import SearchFilters from "../../components/SearchFilters";
import MastersResults from "../../components/MastersResults";
import ResizableColumns from "../../components/ResizableColumns";

export default async function ServicesPage({ searchParams }) {
  const city = searchParams?.city ?? "Kyiv";
  const q = searchParams?.q ?? "";
  const limit = Math.max(1, Math.min(50, parseInt(searchParams?.limit ?? "12", 10) || 12));
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const skip = (page - 1) * limit;
  const start = searchParams?.start ?? "";
  const end = searchParams?.end ?? "";
  const price_min = searchParams?.price_min ?? "";
  const price_max = searchParams?.price_max ?? "";
  const rating_min = searchParams?.rating_min ?? "";
  const accept_home = searchParams?.accept_home ?? "";
  const at_salon = searchParams?.at_salon ?? "";
  const own_premises = searchParams?.own_premises ?? "";
  const visiting_client = searchParams?.visiting_client ?? "";
  const user_lat = searchParams?.user_lat ?? "";
  const user_lon = searchParams?.user_lon ?? "";
  const max_distance_km = searchParams?.max_distance_km ?? "";
  const sort = searchParams?.sort ?? "";
  const origin = getSiteOrigin();
  let items = [];
  let total = 0;
  let ownersRatings = {};
  let ownersLocations = {};
  if (start && end) {
    // Strict availability: get service IDs, then fetch a larger list and filter client-side
    const qsAvail = new URLSearchParams({ city, start, end });
    if (q) qsAvail.set("q", q);
    const availRes = await fetch(`${origin}/api/services/public/available?${qsAvail.toString()}`, { cache: "no-store" });
    const avail = availRes.ok ? await availRes.json() : { service_ids: [] };
    const ids = new Set(avail.service_ids || []);
    const qsList = new URLSearchParams({ city, limit: String(500), skip: String(0) });
    if (q) qsList.set("q", q);
    if (price_min) qsList.set("price_min", String(price_min));
    if (price_max) qsList.set("price_max", String(price_max));
    if (rating_min) qsList.set("rating_min", String(rating_min));
    if (accept_home) qsList.set("accept_home", String(accept_home));
    if (at_salon) qsList.set("at_salon", String(at_salon));
    if (own_premises) qsList.set("own_premises", String(own_premises));
    if (visiting_client) qsList.set("visiting_client", String(visiting_client));
    if (user_lat) qsList.set("user_lat", String(user_lat));
    if (user_lon) qsList.set("user_lon", String(user_lon));
    if (max_distance_km) qsList.set("max_distance_km", String(max_distance_km));
    const listRes = await fetch(`${origin}/api/services/public?${qsList.toString()}`, { cache: "no-store" });
    const listData = listRes.ok ? await listRes.json() : { items: [] };
    const all = listData.items || [];
    const filtered = all.filter((s) => ids.has(s.id));
    total = filtered.length;
    items = filtered.slice(skip, skip + limit);
    ownersRatings = listData.owners_ratings || {};
    ownersLocations = listData.owners_locations || {};
  } else {
    const qs = new URLSearchParams({ city, limit: String(limit), skip: String(skip) });
    if (q) qs.set("q", q);
    if (price_min) qs.set("price_min", String(price_min));
    if (price_max) qs.set("price_max", String(price_max));
    if (rating_min) qs.set("rating_min", String(rating_min));
    if (accept_home) qs.set("accept_home", String(accept_home));
    if (at_salon) qs.set("at_salon", String(at_salon));
    if (own_premises) qs.set("own_premises", String(own_premises));
    if (visiting_client) qs.set("visiting_client", String(visiting_client));
    if (user_lat) qs.set("user_lat", String(user_lat));
    if (user_lon) qs.set("user_lon", String(user_lon));
    if (max_distance_km) qs.set("max_distance_km", String(max_distance_km));
    if (sort) qs.set("sort", String(sort));
    if (max_distance_km) qs.set("max_distance_km", String(max_distance_km));
    if (sort) qs.set("sort", String(sort));
    const res = await fetch(`${origin}/api/services/public?${qs.toString()}`, { cache: "no-store" });
    const data = res.ok ? await res.json() : { items: [], total: 0 };
    items = data.items || [];
    total = typeof data.total === "number" ? data.total : items.length;
    ownersRatings = data.owners_ratings || {};
    ownersLocations = data.owners_locations || {};
  }
  const showingStart = items.length ? skip + 1 : 0;
  const showingEnd = skip + items.length;
  const hasPrev = page > 1;
  const hasNext = skip + items.length < total;

  const baseParams = new URLSearchParams({ city, limit: String(limit) });
  if (q) baseParams.set("q", q);
  if (start) baseParams.set("start", start);
  if (end) baseParams.set("end", end);
  if (price_min) baseParams.set("price_min", String(price_min));
  if (price_max) baseParams.set("price_max", String(price_max));
  if (rating_min) baseParams.set("rating_min", String(rating_min));
  if (accept_home) baseParams.set("accept_home", String(accept_home));
  if (at_salon) baseParams.set("at_salon", String(at_salon));
  if (own_premises) baseParams.set("own_premises", String(own_premises));
  if (visiting_client) baseParams.set("visiting_client", String(visiting_client));
  if (user_lat) baseParams.set("user_lat", String(user_lat));
  if (user_lon) baseParams.set("user_lon", String(user_lon));
  if (max_distance_km) baseParams.set("max_distance_km", String(max_distance_km));
  if (sort) baseParams.set("sort", String(sort));
  const prevParams = new URLSearchParams(baseParams);
  prevParams.set("page", String(page - 1));
  const nextParams = new URLSearchParams(baseParams);
  nextParams.set("page", String(page + 1));
  const uaMap = {
    Kyiv: "м. Київ",
    Lviv: "м. Львів",
    Odesa: "м. Одеса",
    Kharkiv: "м. Харків",
    Dnipro: "м. Дніпро",
    Zaporizhzhia: "м. Запоріжжя",
    Vinnytsia: "м. Вінниця",
    Zhytomyr: "м. Житомир",
    Chernihiv: "м. Чернігів",
    Sumy: "м. Суми",
    Poltava: "м. Полтава",
    Cherkasy: "м. Черкаси",
    Kropyvnytskyi: "м. Кропивницький",
    Mykolaiv: "м. Миколаїв",
    Kherson: "м. Херсон",
    "Ivano-Frankivsk": "м. Івано-Франківськ",
    Ternopil: "м. Тернопіль",
    Lutsk: "м. Луцьк",
    Uzhhorod: "м. Ужгород",
    Rivne: "м. Рівне",
    Chernivtsi: "м. Чернівці",
  };
  const cityUa = uaMap[city] || city;
  const filtersInitial = {
    q,
    city,
    start,
    end,
    limit,
    price_min,
    price_max,
    max_distance_km,
    rating_min,
    accept_home,
    at_salon,
    own_premises,
    visiting_client,
    user_lat,
    user_lon,
    view: searchParams?.view ?? "grid",
  };
  const qsViewGrid = new URLSearchParams(baseParams); qsViewGrid.set("view", "grid");
  const qsViewList = new URLSearchParams(baseParams); qsViewList.set("view", "list");
  return (
    <section>
      <h1 className="hero-title">Пошук майстрів {cityUa ? `— ${cityUa}` : ""}</h1>
      <p className="hero-subtitle">Знайдіть свого спеціаліста та зручний час</p>
      <ServicesFilter initialQ={q} initialCity={city} initialStart={start} initialEnd={end} initialLimit={limit} />

      <div style={{ marginTop: 12 }}>
        <ResizableColumns
          initialLeftWidth={280}
          minLeftWidth={200}
          maxLeftWidth={480}
          rightFixedWidth={360}
          gap={12}
          left={(
            <SearchFilters initialParams={filtersInitial} />
          )}
          middle={(
            <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <div className="muted">Вид:</div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`?${qsViewGrid.toString()}`} className="nav-link">Плитки</a>
              <a href={`?${qsViewList.toString()}`} className="nav-link">Список</a>
              </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <div className="muted">Сортування:</div>
              {(() => { const qs = new URLSearchParams(baseParams); qs.delete("sort"); return <a href={`?${qs.toString()}`} className="nav-link">Релевантність</a>; })()}
              {(() => { const qs = new URLSearchParams(baseParams); qs.set("sort", "distance"); return <a href={`?${qs.toString()}`} className="nav-link">Відстань</a>; })()}
              {(() => { const qs = new URLSearchParams(baseParams); qs.set("sort", "price_asc"); return <a href={`?${qs.toString()}`} className="nav-link">Ціна ↑</a>; })()}
              {(() => { const qs = new URLSearchParams(baseParams); qs.set("sort", "price_desc"); return <a href={`?${qs.toString()}`} className="nav-link">Ціна ↓</a>; })()}
              {(() => { const qs = new URLSearchParams(baseParams); qs.set("sort", "rating_desc"); return <a href={`?${qs.toString()}`} className="nav-link">Рейтинг</a>; })()}
            </div>
      </div>
          <MastersResults items={items} ownersRatings={ownersRatings} ownersLocations={ownersLocations} userLocation={(user_lat && user_lon) ? { lat: parseFloat(user_lat), lon: parseFloat(user_lon) } : null} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        <div className="muted">{`Показано ${showingStart}-${showingEnd} з ${total}`}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`?${prevParams.toString()}`}
            className="nav-link"
            aria-disabled={!hasPrev}
            style={{ pointerEvents: hasPrev ? "auto" : "none", opacity: hasPrev ? 1 : 0.5 }}
          >Попередня</a>
          <a
            href={`?${nextParams.toString()}`}
            className="nav-link"
            aria-disabled={!hasNext}
            style={{ pointerEvents: hasNext ? "auto" : "none", opacity: hasNext ? 1 : 0.5 }}
          >Наступна</a>
            </div>
          </div>
            </div>
          )}
          right={null}
        />
      </div>
    </section>
  );
}


