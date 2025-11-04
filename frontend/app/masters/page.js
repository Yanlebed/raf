import MastersCityControls from "../../components/MastersCityControls";
import { getSiteOrigin } from "../../lib/site";

export default async function MastersPage({ searchParams }) {
  const city = searchParams?.city ?? "Kyiv";
  const sort = searchParams?.sort ?? "rating_desc";
  const qs = new URLSearchParams({ user_type: "MASTER", city });
  const origin = getSiteOrigin();
  const res = await fetch(`${origin}/api/users?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  let items = data.items || [];

  // Pull owner ratings from services listing for this city (best-effort)
  let ownersRatings = {};
  try {
    const ratingsRes = await fetch(`${origin}/api/services/public?${new URLSearchParams({ city, limit: String(500), skip: String(0) }).toString()}`, { cache: "no-store" });
    const ratingsData = ratingsRes.ok ? await ratingsRes.json() : {};
    ownersRatings = ratingsData?.owners_ratings || {};
  } catch {}

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

  // Sort
  if (sort === "rating_desc") {
    items = [...items].sort((a, b) => {
      const ra = ownersRatings?.[a.id]?.avg ?? -1;
      const rb = ownersRatings?.[b.id]?.avg ?? -1;
      return (rb ?? -1) - (ra ?? -1);
    });
  } else if (sort === "name") {
    items = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  const baseParams = new URLSearchParams({ city });
  const qsRating = new URLSearchParams(baseParams); qsRating.set("sort", "rating_desc");
  const qsName = new URLSearchParams(baseParams); qsName.set("sort", "name");

  return (
    <section>
      <h1 className="hero-title">Майстри {cityUa ? `— ${cityUa}` : ""}</h1>
      <p className="hero-subtitle">Знайдіть свого майстра поруч.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <div className="muted">Сортування:</div>
        <a href={`?${qsRating.toString()}`} className="nav-link">Рейтинг</a>
        <a href={`?${qsName.toString()}`} className="nav-link">Ім'я</a>
      </div>
      <MastersCityControls initialCity={city} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="muted">Нічого не знайдено.</div>
        ) : (
          items.map((m) => (
            <div key={m.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div aria-hidden style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                <div style={{ fontWeight: 700 }}><a href={`/masters/${m.id}`}>{m.name || `Майстер #${m.id}`}</a></div>
                {(() => {
                  const r = ownersRatings?.[m.id];
                  if (!r || typeof r.avg !== "number") return null;
                  return (
                    <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 999, padding: "2px 8px", fontSize: 12 }}>
                      ⭐ {Number(r.avg).toFixed(1)}{typeof r.count === "number" ? ` (${r.count})` : ""}
                    </div>
                  );
                })()}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>{m.city || "Місто"}{m.address ? `, ${m.address}` : ""}</div>
              {m.short_description ? <div className="muted" style={{ marginTop: 8 }}>{m.short_description}</div> : null}
              <div style={{ marginTop: 10 }}>
                <a className="button" href={`/services?${new URLSearchParams({ q: m.specialization || "", city }).toString()}`} style={{ fontSize: 12, padding: "6px 10px" }}>Переглянути послуги</a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}



