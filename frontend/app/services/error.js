"use client";

export default function Error({ error, reset }) {
  return (
    <section>
      <h1 className="hero-title">Services error</h1>
      <p className="hero-subtitle">{error?.message || "Failed to load services."}</p>
      <button className="button" onClick={() => reset()}>Retry</button>
    </section>
  );
}


