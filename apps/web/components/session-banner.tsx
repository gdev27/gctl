"use client";

import { useEffect, useState } from "react";
import { getOperatorSession, updateWorkspacePreferences } from "../lib/api";
import { DisplayMode, SessionView } from "../lib/types";
import { DEFAULT_DISPLAY_MODE, DEFAULT_SESSION_VIEW } from "../lib/workspace";

const MODE_KEY = "gctl.settings.mode";
const SESSION_VIEW_KEY = "gctl.session.viewMode";
const SESSION_CONTROLS_OPEN_KEY = "gctl.session.controlsOpen";
const SETTINGS_UPDATED_EVENT = "gctl:settings-updated";

export function SessionBanner() {
  const [mode, setMode] = useState<SessionView>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SESSION_VIEW;
    }
    const saved = window.localStorage.getItem(SESSION_VIEW_KEY);
    return saved === "investigation" ? "investigation" : DEFAULT_SESSION_VIEW;
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DEFAULT_DISPLAY_MODE);
  const [announce, setAnnounce] = useState("");
  const [accountLabel, setAccountLabel] = useState("Guest workspace");
  const [controlsOpen, setControlsOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(SESSION_CONTROLS_OPEN_KEY) === "true";
  });

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
    void (async () => {
      const sessionResult = await getOperatorSession();
      if (sessionResult.session) {
        setAccountLabel(sessionResult.session.name);
        setMode(sessionResult.session.preferences.sessionView);
        setDisplayMode(sessionResult.session.preferences.displayMode);
      }
    })();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_UPDATED_EVENT, syncDisplayMode);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, syncDisplayMode);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SESSION_VIEW_KEY, mode);
    document.body.dataset.viewMode = mode;
    void updateWorkspacePreferences({ sessionView: mode });
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem(SESSION_CONTROLS_OPEN_KEY, controlsOpen ? "true" : "false");
  }, [controlsOpen]);

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
      <button type="button" className="btn btn-sm" onClick={() => setControlsOpen((value) => !value)}>
        {controlsOpen ? "Hide display controls" : "Display controls"}
      </button>
      {controlsOpen ? (
        <div className="row session-controls">
          <span className="pill neutral">View: {mode}</span>
          <span className="pill neutral">Mode: {displayMode === "live" ? "live" : "demo"}</span>
          <span className="pill neutral">Workspace: {accountLabel}</span>
          <button type="button" className="btn btn-sm" onClick={toggleMode}>
            Switch to {mode === "overview" ? "investigation" : "overview"} view
          </button>
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {announce || blurb}
      </span>
    </div>
  );
}
