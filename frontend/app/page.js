"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DateRangePicker from "../components/DateRangePicker";

function formatDateISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const today = useMemo(() => new Date(), []);
  const aWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);
  const [start, setStart] = useState(formatDateISO(today));
  const [end, setEnd] = useState(formatDateISO(aWeek));

  // Typewriter for placeholder examples
  const examples = useMemo(() => ["манікюр", "масаж", "стрижка", "брови", "візаж", "SPA", "майстер Анна", "майстер Олег", "салон Aura"], []);
  const [exIdx, setExIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    const current = examples[exIdx] || "";
    let t;
    if (phase === "typing") {
      if (typed.length < current.length) {
        t = setTimeout(() => setTyped(current.slice(0, typed.length + 1)), 90);
      } else {
        setPhase("pausing");
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("deleting"), 900);
    } else if (phase === "deleting") {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(current.slice(0, typed.length - 1)), 50);
      } else {
        setExIdx((i) => (i + 1) % examples.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [typed, phase, exIdx, examples]);

  function onSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    router.push(`/services?${params.toString()}`);
  }

  const popularCategories = [
    { label: "Перукар", emoji: "💇‍♀️" },
    { label: "Майстер манікюру", emoji: "💅" },
    { label: "Косметолог", emoji: "🧖‍♀️" },
    { label: "Візажист", emoji: "💄" },
    { label: "Масажист", emoji: "💆‍♂️" },
  ];

  const topProcedures = [
    { label: "Стрижка", emoji: "✂️" },
    { label: "Манікюр", emoji: "💅" },
    { label: "Чистка обличчя", emoji: "🫧" },
    { label: "Корекція бровей", emoji: "👁️" },
    { label: "Апаратний масаж", emoji: "💆" },
  ];

  return (
    <section className="hero" style={{ paddingTop: 24 }}>
      <div style={{ position: "relative", width: "100%", borderRadius: 16, background: "#f7f7f7", border: "1px solid var(--border)", overflow: "hidden", minHeight: 320 }}>
        {/* Placeholder for image; replace background when asset is ready */}
        <div style={{ width: "100%", height: 320, background: "radial-gradient(circle at center, #e7f0ec 0%, #e7f0ec 38%, transparent 40%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-start", padding: 16 }}>
          <div style={{ maxWidth: 820, marginLeft: "6%", textAlign: "left" }}>
            <div style={{ fontSize: "clamp(18px, 2.88vw, 30.6px)", fontWeight: 700, lineHeight: 1.15 }}>Тут ти знайдеш усі б’юті процедури, майстрів та салони.</div>
            <div className="muted" style={{ marginTop: 8, fontSize: "clamp(12.6px, 1.8vw, 16.2px)" }}>Підбери свого майстра на зручний час.</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }} className="muted">Пошук за назвою процедури або за спеціалістом</div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "80%" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={typed}
                aria-label="Пошук послуг"
                style={{ width: "100%", height: 48, padding: "0 14px 0 36px", borderRadius: 12, border: "1px solid var(--border)" }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DateRangePicker
              initialStart={start}
              initialEnd={end}
              onChange={(s, e) => { setStart(s); setEnd(e); }}
            />
          </div>
          <button className="button" type="submit" style={{ height: 44, padding: "0 18px" }}>Знайти</button>
        </div>
      </form>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, textAlign: "center" }}>Популярні категорії</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14, textAlign: "center" }}>серед більш ніж сотні по всій Україні представлених на сайті</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
          {popularCategories.map((c) => {
            const href = `/services?${new URLSearchParams({ q: c.label }).toString()}`;
            return (
              <a key={c.label} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    aria-hidden
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "linear-gradient(135deg, #f0f7ff 0%, #fff5f7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                    }}
                  >{c.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>{c.label}</div>
                </div>
              </a>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <a href="/categories" className="button" style={{ textDecoration: "none" }}>Переглянути всі категорії</a>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, textAlign: "center" }}>Як це працює?</h2>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px 1fr 60px 1fr", alignItems: "center", gap: 12 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, textAlign: "center", minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            Пошук та підбір майстра на потрібну дату і час
          </div>
          <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden>
            <defs>
              <marker id="arrowhead1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#9CA3AF" />
              </marker>
            </defs>
            <line x1="0" y1="12" x2="56" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead1)" />
          </svg>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, textAlign: "center", minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            Натиснути "Записатися"
          </div>
          <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden>
            <defs>
              <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#9CA3AF" />
              </marker>
            </defs>
            <line x1="0" y1="12" x2="56" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead2)" />
          </svg>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, textAlign: "center", minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            Отримати повідомлення про підтвердження запису
          </div>
          <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden>
            <defs>
              <marker id="arrowhead3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#9CA3AF" />
              </marker>
            </defs>
            <line x1="0" y1="12" x2="56" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead3)" />
          </svg>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, textAlign: "center", minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            Прийти на процедуру
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div
            aria-hidden
            style={{
              width: "100%",
              height: 280,
              background:
                "radial-gradient(1200px 280px at 70% 50%, rgba(255, 231, 240, 0.9), transparent), radial-gradient(1000px 260px at 30% 50%, rgba(231, 240, 255, 0.9), transparent)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16 }}>
            <div>
              <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800 }}>Ласкаво просимо!</div>
              <div className="muted" style={{ marginTop: 8, fontSize: "clamp(14px, 2vw, 18px)" }}>Отримайте спеціальний бонус 10% на ваш перший запис</div>
              <div style={{ marginTop: 14 }}>
                <a href="/services" className="button" style={{ textDecoration: "none", padding: "10px 18px" }}>Записатися</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, textAlign: "center" }}>Топ процедур</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14, textAlign: "center" }}>із понад тисячі варіантів, що пропонують наші майстри</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
          {topProcedures.map((p) => {
            const href = `/services?${new URLSearchParams({ q: p.label }).toString()}`;
            return (
              <a key={p.label} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    aria-hidden
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "linear-gradient(135deg, #f0f7ff 0%, #fff5f7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                    }}
                  >{p.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>{p.label}</div>
                </div>
              </a>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <a href="/procedures" className="button" style={{ textDecoration: "none" }}>Переглянути усі процедури</a>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, textAlign: "center" }}>Найпоширеніші питання</h2>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Це безкоштовно? Чи потрібно платити за використання платформи?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Так, використання нашої платформи абсолютно безкоштовно для клієнтів.</div>
          </details>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Як я можу бути впевненим у кваліфікації майстра?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Переглядайте рейтинг і відгуки, портфоліо робіт, а також позначки перевірених профілів. Це допоможе обрати надійного спеціаліста.</div>
          </details>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Чи можу я змінити або скасувати запис?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Так. Відкрийте сторінку вашого бронювання (через лист/SMS або у розділі "Мої записи") й натисніть змінити або скасувати. Якщо до візиту залишилося зовсім мало часу, зв’яжіться з майстром або підтримкою.</div>
          </details>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Які методи оплати доступні?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Залежно від майстра/салону доступні: готівка, картка та онлайн-оплата. Актуальні способи оплати відображаються під час оформлення запису.</div>
          </details>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Як зв'язатись зі службою підтримки?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Звертайтесь за телефоном 067 123 45 67 або на email info@raf.ua (контакти також є у футері). Графік роботи підтримки: 08:00–21:00.</div>
          </details>
          <details style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Чи потрібна реєстрація для запису?</summary>
            <div className="muted" style={{ marginTop: 8 }}>Повноцінна реєстрація не обов’язкова — достатньо підтвердити номер телефону через SMS. Ваш обліковий запис створиться автоматично для збереження записів.</div>
          </details>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div
            aria-hidden
            style={{
              width: "100%",
              height: 280,
              background:
                "radial-gradient(1200px 280px at 70% 50%, rgba(231, 255, 245, 0.9), transparent), radial-gradient(1000px 260px at 30% 50%, rgba(240, 240, 255, 0.9), transparent)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16 }}>
            <div>
              <div style={{ fontSize: "clamp(18px, 2.6vw, 26px)", fontWeight: 800 }}>Ви - салон, студія чи самостійний майстер?</div>
              <div className="muted" style={{ marginTop: 8, fontSize: "clamp(14px, 2vw, 18px)" }}>Доєднуйтесь до нас і отримуйте записи на процедури разом  із RAF.</div>
              <div style={{ marginTop: 14 }}>
                <a href="/partners" className="button" style={{ textDecoration: "none", padding: "10px 18px" }}>Залишити заявку</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


