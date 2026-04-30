import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Activity } from "lucide-react";
import StatTile from "../app/StatTile";
import StatusBadge from "../app/StatusBadge";
import ChainBadge from "../app/ChainBadge";
import { format, formatDistanceToNow } from "date-fns";
import { useOpsEnvelope } from "@/hooks/useOpsEnvelope";
import SourceBadge from "@/components/trust/SourceBadge";
import FallbackBanner from "@/components/trust/FallbackBanner";
import ConnectorRail from "./ConnectorRail";

export default function OverviewTab({ agents, txs }) {
  const { data: overviewEnvelope } = useOpsEnvelope("/api/ops/overview", ["ops", "overview"]);
  const { data: connectorsEnvelope } = useOpsEnvelope("/api/ops/connectors", ["ops", "connectors"]);

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const totalValue = agents.reduce((s, a) => s + (a.total_value_moved || 0), 0);
  const txCount = agents.reduce((s, a) => s + (a.tx_count || 0), 0);
  const blocked = txs.filter((t) => t.status === "policy_blocked").length;

  const fallbackEnvelope = [overviewEnvelope, connectorsEnvelope].find(
    (e) => e && e.source === "fallback",
  );

  const statusEnvelope = overviewEnvelope || connectorsEnvelope;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Mission control snapshot
        </p>
        {statusEnvelope && (
          <SourceBadge trustStatus={statusEnvelope.trustStatus} source={statusEnvelope.source} />
        )}
      </div>

      {fallbackEnvelope && (
        <FallbackBanner
          reasonCode={fallbackEnvelope.reasonCode}
          recoveryAction={fallbackEnvelope.recoveryAction}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Active agents" value={activeAgents} sublabel={`${agents.length} total`} accent />
        <StatTile label="Value moved" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sublabel="all-time" />
        <StatTile label="Transactions" value={txCount.toLocaleString()} sublabel="executed onchain" />
        <StatTile label="Policy blocks" value={blocked} sublabel="last 8 events" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-medium">Agents</h2>
            <Link to="/dashboard/agents" className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              view all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {agents.length === 0 ? (
            <EmptyState
              title="No agents yet"
              description="Create your first policy-constrained agent to get started."
              action={<Link to="/dashboard/agents"><Button size="sm" className="bg-primary text-primary-foreground">Create agent</Button></Link>}
            />
          ) : (
            <ul className="divide-y divide-border">
              {agents.slice(0, 6).map((a) => (
                <li key={a.id} className="px-5 py-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium truncate">{a.name}</span>
                      <ChainBadge chain={a.chain} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate font-mono">{a.objective || a.description || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <StatusBadge status={a.status} />
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {a.last_run_at ? formatDistanceToNow(new Date(a.last_run_at), { addSuffix: true }) : "never run"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="font-medium">Live activity</h2>
          </div>
          {txs.length === 0 ? (
            <EmptyState title="Quiet" description="No transactions yet." />
          ) : (
            <ul className="divide-y divide-border">
              {txs.slice(0, 8).map((t) => (
                <li key={t.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono truncate">{t.action_type || "tx"} · ${(t.value_usd || 0).toFixed(0)}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1 truncate">
                    {t.agent_name || "—"} · {t.executed_at ? format(new Date(t.executed_at), "HH:mm:ss") : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConnectorRail />
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
