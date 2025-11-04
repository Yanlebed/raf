export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "0.75rem 0", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
      <div style={{ minWidth: 220 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <div className="brand-badge" /> RAF
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Платформа б'юті послуг</div>
        <div className="muted" style={{ marginTop: 8 }}>© {year} RAF</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: 16, flex: 1 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <a href="/about" className="nav-link">Про нас</a>
          <a href="/policy" className="nav-link">Політика конфіденційності</a>
          <a href="/partners" className="nav-link">Партнерам</a>
          <a href="/terms" className="nav-link">Правила сервісу</a>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <a href="/categories" className="nav-link">Майстри</a>
          <a href="/salons" className="nav-link">Салони</a>
          <a href="/services" className="nav-link">Процедури та послуги</a>
          <a href="/promos" className="nav-link">Спеціальні пропозиції</a>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <div className="nav-link">067 123 45 67</div>
          <a href="mailto:info@raf.ua" className="nav-link">info@raf.ua</a>
          <div className="muted">Графік роботи служби підтримки: 08:00–21:00</div>
        </div>
      </div>
    </div>
  );
}


