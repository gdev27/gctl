"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionBanner } from "./session-banner";
import { SideNav } from "./side-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 980px)");
    const applyLayout = () => setIsMobileLayout(media.matches);
    applyLayout();
    media.addEventListener("change", applyLayout);
    return () => media.removeEventListener("change", applyLayout);
  }, []);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/runs");
      }
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    }

    if (navOpen) {
      document.body.classList.add("nav-open");
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  return (
    <div className="layout">
      <SideNav navOpen={navOpen} isMobileLayout={isMobileLayout} onClose={() => setNavOpen(false)} />
      {navOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <main className="shell" id="main-content">
        <button
          type="button"
          className="btn mobile-nav-toggle"
          onClick={() => setNavOpen((value) => !value)}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span aria-hidden="true">{navOpen ? "X" : "|||"}</span>
          <span className="sr-only">{navOpen ? "Close menu" : "Open menu"}</span>
        </button>
        <SessionBanner />
        {children}
      </main>
    </div>
  );
}
