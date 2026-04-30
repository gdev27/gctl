import React from "react";
import { Fingerprint, Copy } from "lucide-react";
import { useOpsEnvelope } from "@/hooks/useOpsEnvelope";
import SourceBadge from "@/components/trust/SourceBadge";

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore clipboard failures
        }
      }}
      className="inline-flex items-center gap-1 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title="Copy to clipboard"
    >
      <Copy className="w-3 h-3" />
      {copied && <span className="text-[10px] font-mono">copied</span>}
    </button>
  );
}

export default function IdentityEvidencePanel({ className = "" }) {
  const { data: envelope, isLoading } = useOpsEnvelope("/api/ops/evidence", ["ops", "evidence"]);
  const evidence = envelope?.data || [];

  return (
    <div className={`rounded-xl border border-border bg-card/40 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-medium">Identity evidence</h2>
        </div>
        {envelope && <SourceBadge trustStatus={envelope.trustStatus} source={envelope.source} />}
      </div>
      <div className="p-5">
        {isLoading ? (
          <p className="text-xs text-muted-foreground font-mono">Loading…</p>
        ) : evidence.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No attestation records yet. Run the deterministic or swarm demo to populate ENS evidence.
          </p>
        ) : (
          <ul className="space-y-3">
            {evidence.map((item, idx) => (
              <li
                key={`${item.ensName}-${idx}`}
                className="rounded-md border border-border bg-background/40 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-foreground truncate">{item.ensName}</span>
                  <CopyButton text={item.ensName} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-muted-foreground">
                  <span>role: {item.role}</span>
                  {item.capabilities && item.capabilities.length > 0 && (
                    <span>capabilities: {item.capabilities.join(", ")}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                  <span className="font-mono text-[10px] text-muted-foreground truncate">
                    attestation: {item.attestation}
                  </span>
                  <CopyButton text={item.attestation} />
                </div>
                {item.auditPath && (
                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                    audit: {item.auditPath}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
