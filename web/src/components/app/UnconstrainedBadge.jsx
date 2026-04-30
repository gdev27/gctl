import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Warning badge shown on agents with no policy_id.
 * An unconstrained agent has no deterministic guardrails — surface it loudly.
 */
export default function UnconstrainedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-[hsl(var(--chart-4))]/30 bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]"
      title="This agent has no policy bound — actions are not guardrailed"
    >
      <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2.25} />
      unconstrained
    </span>
  );
}