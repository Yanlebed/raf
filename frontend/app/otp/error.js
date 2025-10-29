"use client";

export default function Error({ error, reset }) {
  return (
    <section style={{ maxWidth: 420 }}>
      <h1 className="hero-title">OTP error</h1>
      <p className="hero-subtitle">{error?.message || "Something went wrong."}</p>
      <button className="button" onClick={() => reset()}>Try again</button>
    </section>
  );
}


