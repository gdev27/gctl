"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../../components/page-header";

const INDEXER_KEY = "gctl.settings.indexerUrl";
const MODE_KEY = "gctl.settings.mode";

export default function SettingsPage() {
  const [indexerUrl, setIndexerUrl] = useState("http://localhost:4300");
  const [mode, setMode] = useState("demo");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedIndexer = window.localStorage.getItem(INDEXER_KEY);
    const savedMode = window.localStorage.getItem(MODE_KEY);
    if (savedIndexer) {
      setIndexerUrl(savedIndexer);
    }
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  function saveSettings() {
    if (!indexerUrl.startsWith("http://") && !indexerUrl.startsWith("https://")) {
      setSaveMessage("Please enter a valid URL starting with http:// or https://");
      return;
    }
    window.localStorage.setItem(INDEXER_KEY, indexerUrl);
    window.localStorage.setItem(MODE_KEY, mode);
    setSaveMessage("Preferences saved for this browser profile.");
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Settings"
        title="Environment and operating preferences"
        description="Manage local UI preferences. Data source routing still follows deployment environment variables."
      />

      <div className="grid grid-2">
        <article className="card">
          <h3>Indexer endpoint reference</h3>
          <label htmlFor="indexerUrl" className="field">
            <span className="field-label">URL</span>
            <input
              className="input mono"
              id="indexerUrl"
              value={indexerUrl}
              onChange={(event) => setIndexerUrl(event.target.value)}
            />
          </label>
          <p className="muted" style={{ marginBottom: 0 }}>
            Stored locally as an operator reference; runtime API routing is controlled by deployment env vars.
          </p>
        </article>
        <article className="card">
          <h3>Display mode preference</h3>
          <label className="field">
            <span className="field-label">Mode</span>
            <select className="select" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="demo">Demo-safe</option>
              <option value="live">Live-data</option>
            </select>
          </label>
          <p className="muted">This controls your preferred UI wording and reminder copy only.</p>
        </article>
        <article className="card" style={{ gridColumn: "1 / -1" }}>
          <h3>Trust visibility</h3>
          <p className="muted">Evidence panes show identity, policy, and audit links together to reduce ambiguity.</p>
          <p style={{ marginBottom: 0 }}>
            Changing settings never modifies permissions or backend source selection.
          </p>
        </article>
      </div>

      <div className="row" style={{ marginTop: 4 }}>
        <button type="button" onClick={saveSettings} className="btn btn-primary">
          Save settings
        </button>
        {saveMessage ? <span className="muted" aria-live="polite">{saveMessage}</span> : null}
      </div>
    </section>
  );
}
