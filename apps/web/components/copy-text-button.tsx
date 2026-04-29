"use client";

import { useEffect, useRef, useState } from "react";

export function CopyTextButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const failedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      if (failedTimeoutRef.current !== null) {
        window.clearTimeout(failedTimeoutRef.current);
      }
    };
  }, []);

  async function onCopy() {
    try {
      if (!window.isSecureContext || !navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch (_error: unknown) {
      setFailed(true);
      if (failedTimeoutRef.current !== null) {
        window.clearTimeout(failedTimeoutRef.current);
      }
      failedTimeoutRef.current = window.setTimeout(() => setFailed(false), 1800);
    }
  }

  return (
    <button type="button" className="btn btn-sm" onClick={onCopy} aria-live="polite">
      {failed ? "Unavailable" : copied ? "Copied" : "Copy"}
    </button>
  );
}
