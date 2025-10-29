"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <main className="main">
          <div className="container">
            <section>
              <h1 className="hero-title">Something went wrong</h1>
              <p className="hero-subtitle">{error?.message || "Unexpected error occurred."}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="button" onClick={() => reset()}>Try again</button>
                <a href="/" className="nav-link" style={{ display: "inline-flex", alignItems: "center", height: 40 }}>Go home</a>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}


