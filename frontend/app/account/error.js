"use client";

export default function Error({ error, reset }) {
  return (
    <section>
      <h1 className="hero-title">Account error</h1>
      <p className="hero-subtitle">{error?.message || "Failed to load account."}</p>
      <button className="button" onClick={() => reset()}>Retry</button>
    </section>
  );
}


