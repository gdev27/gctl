import React from "react";
import { CircleDot, ArrowRight, Plug } from "lucide-react";
import { Link } from "react-router-dom";
import { useOpsEnvelope } from "@/hooks/useOpsEnvelope";
import SourceBadge from "@/components/trust/SourceBadge";

const HEALTH_TONE = {
  connected: { dot: "text-primary", label: "text-primary" },
  degraded: { dot: "text-[hsl(var(--chart-4))]", label: "text-[hsl(var(--chart-4))]" },
  disconnected: { dot: "text-destructive", label: "text-destructive" },
};

function formatRelative(timestamp) {
  if (!timestamp) return null;
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "just now";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function ConnectorRail() {
  const { data: envelope, isLoading } = useOpsEnvelope("/api/ops/connectors", ["ops", "connectors"]);
  const connectors = envelope?.data || [];

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-medium">Connector health</h2>
        </div>
        <div className="flex items-center gap-2">
          {envelope && <SourceBadge trustStatus={envelope.trustStatus} source={envelope.source} />}
          <Link
            to="/onboarding"
            className="text-[11px] font-mono uppercase tracking-wider text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {isLoading && (
          <li className="px-5 py-4 text-xs text-muted-foreground font-mono">Loading…</li>
        )}
        {!isLoading && connectors.length === 0 && (
          <li className="px-5 py-4 text-xs text-muted-foreground">No connector telemetry available.</li>
        )}
        {!isLoading &&
          connectors.map((connector) => {
            const tone = HEALTH_TONE[connector.health] || HEALTH_TONE.degraded;
            return (
              <li key={connector.key} className="px-5 py-3 flex items-start gap-3">
                <CircleDot className={`mt-0.5 w-3.5 h-3.5 shrink-0 ${tone.dot}`} strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm truncate">{connector.label}</p>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${tone.label}`}>
                      {connector.health}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{connector.detail}</p>
                  {connector.lastSync ? (
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      Last sync {formatRelative(connector.lastSync)}
                    </p>
                  ) : connector.recoveryAction ? (
                    <p className="text-[10px] font-mono text-[hsl(var(--chart-4))] mt-0.5 truncate">
                      {connector.recoveryAction}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
