export default function CategoriesPage() {
  const categories = [
    { label: "Перукар", emoji: "💇‍♀️" },
    { label: "Майстер манікюру", emoji: "💅" },
    { label: "Косметолог", emoji: "🧖‍♀️" },
    { label: "Візажист", emoji: "💄" },
    { label: "Масажист", emoji: "💆‍♂️" },
    // Additional common categories (can be expanded later)
    { label: "Бровист", emoji: "👁️" },
    { label: "Педикюр", emoji: "🦶" },
    { label: "Барбер", emoji: "🧔" },
    { label: "Колорист", emoji: "🎨" },
    { label: "SPA", emoji: "🧴" },
  ];

  return (
    <section>
      <h1 className="hero-title">Категорії майстрів</h1>
      <p className="hero-subtitle">Оберіть категорію, щоб переглянути доступні послуги.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {categories.map((c) => {
          const href = `/services?${new URLSearchParams({ q: c.label }).toString()}`;
          return (
            <a key={c.label} href={href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div aria-hidden style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 10, background: "linear-gradient(135deg, #f0f7ff 0%, #fff5f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{c.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>{c.label}</div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}


