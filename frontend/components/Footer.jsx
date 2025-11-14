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
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="nav-link" title="Instagram" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 4, border: "1px solid var(--border)", borderRadius: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="nav-link" title="TikTok" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 4, border: "1px solid var(--border)", borderRadius: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21 8.5a6.5 6.5 0 0 1-5-1.9V16a5 5 0 1 1-5-5 5.9 5.9 0 0 1 1 .09V14a3 3 0 1 0 3 3V2h3a6.5 6.5 0 0 0 3 5.5z" />
            </svg>
          </a>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", alignItems: "start", gap: 16, flex: 1 }}>
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
          <a href="tel:+380671234567" className="nav-link">067 123 45 67</a>
          <a href="mailto:info@raf.ua" className="nav-link">info@raf.ua</a>
          <div style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>Графік роботи служби підтримки</div>
          <div style={{ padding: "0.5rem 0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>08:00–21:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}


