"use client";

import { useEffect, useState } from "react";

type SessionView = "overview" | "investigation";
const MODE_KEY = "gctl.settings.mode";
const SESSION_VIEW_KEY = "gctl.session.viewMode";
const SETTINGS_UPDATED_EVENT = "gctl:settings-updated";

export function SessionBanner() {
  const [mode, setMode] = useState<SessionView>(() => {
    if (typeof window === "undefined") {
      return "overview";
    }
    const saved = window.localStorage.getItem(SESSION_VIEW_KEY);
    return saved === "investigation" ? "investigation" : "overview";
  });
  const [displayMode, setDisplayMode] = useState("demo");
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    function syncDisplayMode() {
      const savedMode = window.localStorage.getItem(MODE_KEY);
      setDisplayMode(savedMode === "live" ? "live" : "demo");
    }
    function onStorage(event: StorageEvent) {
      if (event.key === MODE_KEY && event.newValue) {
        setDisplayMode(event.newValue === "live" ? "live" : "demo");
      }
      if (event.key === SESSION_VIEW_KEY && event.newValue) {
        setMode(event.newValue === "investigation" ? "investigation" : "overview");
      }
    }

    syncDisplayMode();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_UPDATED_EVENT, syncDisplayMode);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, syncDisplayMode);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SESSION_VIEW_KEY, mode);
  }, [mode]);

  const blurb =
    mode === "overview"
      ? "Overview view emphasizes plain-language summaries and top-level health."
      : "Investigation view prioritizes dense evidence and run-level detail.";

  function toggleMode() {
    setMode((previous) => {
      const nextMode = previous === "overview" ? "investigation" : "overview";
      setAnnounce(`View preference switched to ${nextMode}.`);
      return nextMode;
    });
  }

  return (
    <div className="session-banner row-between">
      <div>
        <strong>View preference: {mode}</strong>
        <p className="muted">
          Display mode preference from Settings:{" "}
          {displayMode === "live" ? "Live-data wording" : "Demo-safe wording"}.
        </p>
        <p className="muted">This changes presentation density only and does not affect permissions.</p>
        <p className="muted mb-0">{blurb}</p>
      </div>
      <button type="button" className="btn" onClick={toggleMode}>
        Switch to {mode === "overview" ? "investigation" : "overview"}
      </button>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
