import SalonsCityControls from "../../components/SalonsCityControls";

export default async function SalonsPage({ searchParams }) {
  const city = searchParams?.city ?? "Kyiv";
  const qs = new URLSearchParams({ user_type: "SALON", city });
  const res = await fetch(`/api/users?${qs.toString()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { items: [] };
  const items = data.items || [];

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
      <SalonsCityControls initialCity={city} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="muted">Нічого не знайдено.</div>
        ) : (
          items.map((s) => (
            <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>{s.name || `Салон #${s.id}`}</div>
              <div className="muted" style={{ marginTop: 6 }}>{s.city || "Місто"}{s.address ? `, ${s.address}` : ""}</div>
              {s.short_description ? <div className="muted" style={{ marginTop: 8 }}>{s.short_description}</div> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}


