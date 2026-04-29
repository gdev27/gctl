"use client";

import { useEffect, useState } from "react";
import { SessionBanner } from "./session-banner";
import { SideNav } from "./side-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    }

    if (navOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  return (
    <div className="layout">
      <SideNav navOpen={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen ? <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setNavOpen(false)} /> : null}
      <main className="shell">
        <button
          type="button"
          className="btn mobile-nav-toggle"
          onClick={() => setNavOpen((value) => !value)}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
        >
          {navOpen ? "Close menu" : "Open menu"}
        </button>
        <SessionBanner />
        {children}
      </main>
    </div>
  );
}
