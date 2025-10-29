"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAllDevices } from "../lib/auth";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((me) => {
        if (cancelled) return;
        if (me) {
          setLoggedIn(true);
          setIsAdmin(me.user_type === "ADMIN");
        } else {
          setLoggedIn(false);
          setIsAdmin(false);
        }
      })
      .catch(() => { if (!cancelled) setLoggedIn(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleLogout() {
    await logoutAllDevices();
    setLoggedIn(false);
  }

  return (
    <nav className="nav">
      <Link href="/" className="brand">
        <span className="brand-badge" />
        RAF
      </Link>
      <div className="nav-links">
        <Link href="/services" className="nav-link">Services</Link>
        <Link href="/about" className="nav-link">About</Link>
        {loggedIn ? (
          <>
            <Link href="/account" className="nav-link">Account</Link>
            {isAdmin ? <Link href="/admin/services" className="nav-link">Admin</Link> : null}
            <button className="nav-link" onClick={handleLogout} style={{ background: "transparent", border: 0, cursor: "pointer" }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/otp" className="nav-link">OTP Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}


