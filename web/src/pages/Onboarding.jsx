import React from "react";
import { CheckCircle2, AlertCircle, XCircle, ListChecks } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import { useOpsEnvelope } from "@/hooks/useOpsEnvelope";
import SourceBadge from "@/components/trust/SourceBadge";
import FallbackBanner from "@/components/trust/FallbackBanner";
import ConnectorRail from "../components/dashboard/ConnectorRail";

const STATUS_META = {
  ok: { icon: CheckCircle2, tone: "text-primary", label: "OK" },
  warn: { icon: AlertCircle, tone: "text-[hsl(var(--chart-4))]", label: "WARN" },
  bad: { icon: XCircle, tone: "text-destructive", label: "BAD" },
};

export default function Onboarding() {
  const { data: envelope, isLoading } = useOpsEnvelope("/api/ops/onboarding-checks", [
    "ops",
    "onboarding-checks",
  ]);
  const checks = envelope?.data || [];
  const ok = checks.filter((c) => c.status === "ok").length;
  const total = checks.length;

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// onboarding"
        title="Environment readiness"
        description="Verify indexer, identity, and execution wiring before turning loose autonomous agents."
        action={envelope ? <SourceBadge trustStatus={envelope.trustStatus} source={envelope.source} /> : null}
      />

      <div className="px-6 lg:px-10 py-8 space-y-8">
        {envelope?.source === "fallback" && (
          <FallbackBanner
            reasonCode={envelope.reasonCode}
            recoveryAction={envelope.recoveryAction}
          />
        )}

        <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <h2 className="font-medium">Readiness checks</h2>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {isLoading ? "loading…" : `${ok}/${total} healthy`}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {isLoading && (
              <li className="px-5 py-4 text-xs text-muted-foreground font-mono">Loading…</li>
            )}
            {!isLoading && checks.length === 0 && (
              <li className="px-5 py-4 text-xs text-muted-foreground">No readiness data available.</li>
            )}
            {checks.map((check) => {
              const meta = STATUS_META[check.status] || STATUS_META.warn;
              const Icon = meta.icon;
              return (
                <li key={check.key} className="px-5 py-4 flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.tone}`} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{check.label}</p>
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{check.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <ConnectorRail />
      </div>
    </div>
  );
}
