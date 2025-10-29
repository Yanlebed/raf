export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0" }}>
      <div className="muted">© {year} RAF</div>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent)" }} />
    </div>
  );
}


