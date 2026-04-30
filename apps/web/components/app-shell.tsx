"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionBanner } from "./session-banner";
import { SideNav } from "./side-nav";

const DESKTOP_NAV_COLLAPSED_KEY = "gctl.ui.desktopNavCollapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(DESKTOP_NAV_COLLAPSED_KEY) === "true";
  });

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

  useEffect(() => {
    window.localStorage.setItem(DESKTOP_NAV_COLLAPSED_KEY, desktopNavCollapsed ? "true" : "false");
  }, [desktopNavCollapsed]);

  return (
    <div className="layout" data-nav-collapsed={desktopNavCollapsed ? "true" : "false"}>
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
        <div className="row shell-controls">
          <button
            type="button"
            className="btn mobile-nav-toggle"
            onClick={() => setNavOpen((value) => !value)}
            aria-expanded={navOpen}
            aria-controls="primary-navigation"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span aria-hidden="true">{navOpen ? "Close" : "Menu"}</span>
            <span className="sr-only">{navOpen ? "Close menu" : "Open menu"}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm desktop-nav-toggle"
            onClick={() => setDesktopNavCollapsed((value) => !value)}
          >
            {desktopNavCollapsed ? "Show sidebar" : "Hide sidebar"}
          </button>
        </div>
        <SessionBanner />
        {children}
      </main>
    </div>
  );
}
