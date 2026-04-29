"use client";

import { useEffect, useMemo, useState } from "react";

type SessionView = "overview" | "investigation";
const MODE_KEY = "gctl.settings.mode";

export function SessionBanner() {
  const [mode, setMode] = useState<SessionView>("overview");
  const [displayMode, setDisplayMode] = useState("demo");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(MODE_KEY);
    if (savedMode) {
      setDisplayMode(savedMode);
    }
  }, []);

  const blurb = useMemo(() => {
    if (mode === "overview") {
      return "Overview view emphasizes plain-language summaries and top-level health.";
    }
    return "Investigation view prioritizes dense evidence and run-level detail.";
  }, [mode]);

  return (
    <div className="session-banner row-between">
      <div>
        <strong>View preference: {mode}</strong>
        <p className="muted">
          Display mode preference from Settings: {displayMode === "live" ? "Live-data wording" : "Demo-safe wording"}.
        </p>
        <p className="muted">This changes presentation density only and does not affect permissions.</p>
        <p className="muted" style={{ marginBottom: 0 }}>{blurb}</p>
      </div>
      <button type="button" className="btn" onClick={() => setMode(mode === "overview" ? "investigation" : "overview")}>
        Switch to {mode === "overview" ? "investigation" : "overview"}
      </button>
    </div>
  );
}
