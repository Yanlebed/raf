export default function ProceduresPage() {
  const procedures = [
    { label: "Стрижка", emoji: "✂️" },
    { label: "Манікюр", emoji: "💅" },
    { label: "Чистка обличчя", emoji: "🫧" },
    { label: "Корекція бровей", emoji: "👁️" },
    { label: "Апаратний масаж", emoji: "💆" },
    // Extra common procedures (can be expanded later)
    { label: "Педикюр", emoji: "🦶" },
    { label: "Фарбування волосся", emoji: "🎨" },
    { label: "Ламінування вій", emoji: "👀" },
    { label: "Макіяж", emoji: "💄" },
    { label: "SPA-догляд", emoji: "🧴" },
  ];

  return (
    <section>
      <h1 className="hero-title">Процедури</h1>
      <p className="hero-subtitle">Оберіть процедуру, щоб знайти майстрів та записатися.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {procedures.map((p) => {
          const href = `/services?${new URLSearchParams({ q: p.label }).toString()}`;
          return (
            <a key={p.label} href={href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div aria-hidden style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 10, background: "linear-gradient(135deg, #f0f7ff 0%, #fff5f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{p.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>{p.label}</div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}


