"use client";

import { useState } from "react";

export function CopyTextButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 1800);
    }
  }

  return (
    <button
      type="button"
      className="btn"
      onClick={onCopy}
      style={{ padding: "4px 8px", fontSize: "0.76rem" }}
      aria-live="polite"
    >
      {failed ? "Unavailable" : copied ? "Copied" : "Copy"}
    </button>
  );
}
