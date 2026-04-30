import React from "react";
import { AlertTriangle } from "lucide-react";

export default function FallbackBanner({ reasonCode, recoveryAction, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-[hsl(var(--chart-4))]/30 bg-[hsl(var(--chart-4))]/5 p-4 ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[hsl(var(--chart-4))] mt-0.5 shrink-0" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">Showing demo snapshots</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            One or more <span className="font-mono">/api/ops/*</span> calls returned a fallback envelope.
            Live indexer telemetry is unavailable, so this view is rendered from canned data.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-muted-foreground">
            {reasonCode && (
              <span>
                <span className="text-[hsl(var(--chart-4))]">reason:</span> {reasonCode}
              </span>
            )}
            {recoveryAction && (
              <span>
                <span className="text-[hsl(var(--chart-4))]">recovery:</span> {recoveryAction}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
