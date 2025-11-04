import SalonsCityControls from "../../components/SalonsCityControls";
import { getSiteOrigin } from "../../lib/site";

export default async function SalonsPage({ searchParams }) {
  const city = searchParams?.city ?? "Kyiv";
  const sort = searchParams?.sort ?? "rating_desc";
  const qs = new URLSearchParams({ user_type: "SALON", city });
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/users?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  let items = data.items || [];

  // Aggregate ratings per salon (best-effort via reviews summary API)
  const ratingsEntries = await Promise.all(
    items.map(async (s) => {
      try {
        const r = await fetch(`${origin}/api/reviews/summary?salon_id=${encodeURIComponent(s.id)}`, { cache: "no-store" });
        if (!r.ok) return [s.id, null];
        const j = await r.json();
        return [s.id, j];
      } catch {
        return [s.id, null];
      }
    })
  );
  const ratingsMap = Object.fromEntries(ratingsEntries);

  // Sort
  if (sort === "rating_desc") {
    items = [...items].sort((a, b) => {
      const ra = ratingsMap?.[a.id]?.avg ?? -1;
      const rb = ratingsMap?.[b.id]?.avg ?? -1;
      return (rb ?? -1) - (ra ?? -1);
    });
  } else if (sort === "name") {
    items = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  const baseParams = new URLSearchParams({ city });
  const qsRating = new URLSearchParams(baseParams); qsRating.set("sort", "rating_desc");
  const qsName = new URLSearchParams(baseParams); qsName.set("sort", "name");

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

  return (
    <section>
      <h1 className="hero-title">Салони {cityUa ? `— ${cityUa}` : ""}</h1>
      <p className="hero-subtitle">Усі салони, доступні у вашому місті.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <div className="muted">Сортування:</div>
        <a href={`?${qsRating.toString()}`} className="nav-link">Рейтинг</a>
        <a href={`?${qsName.toString()}`} className="nav-link">Назва</a>
      </div>
      <SalonsCityControls initialCity={city} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="muted">Нічого не знайдено.</div>
        ) : (
          items.map((s) => (
            <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 700 }}><a href={`/salons/${s.id}`}>{s.name || `Салон #${s.id}`}</a></div>
                {(() => {
                  const r = ratingsMap?.[s.id];
                  if (!r || typeof r.avg !== "number") return null;
                  return (
                    <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "2px 8px", fontSize: 12 }}>
                      ⭐ {Number(r.avg).toFixed(1)}{typeof r.count === "number" ? ` (${r.count})` : ""}
                    </div>
                  );
                })()}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>{s.city || "Місто"}{s.address ? `, ${s.address}` : ""}</div>
              {s.short_description ? <div className="muted" style={{ marginTop: 8 }}>{s.short_description}</div> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}


