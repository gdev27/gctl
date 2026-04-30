import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { computePerformance } from "@/lib/performanceMetrics";
import StatTile from "../app/StatTile";
import { VolumeChart, OutcomesChart, LatencyChart } from "./PerformanceCharts";

const formatMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`);
const formatPct = (n) => `${(n * 100).toFixed(1)}%`;
const formatUsd = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const WINDOWS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

export default function PerformanceTab() {
  const [window, setWindow] = React.useState(14);

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactionsAll"],
    queryFn: () => base44.entities.Transaction.list("-executed_at", 500),
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list(),
  });

  const perf = React.useMemo(
    () => computePerformance(transactions, agents, window),
    [transactions, agents, window]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-mono text-muted-foreground">
          Window: last {window} days · {perf.totals.success + perf.totals.failed + perf.totals.blocked} transactions
        </p>
        <div className="flex gap-1 p-1 rounded-md border border-border bg-card/40">
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => setWindow(w.days)}
              className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                window === w.days ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Success rate" value={formatPct(perf.successRate)} sublabel={`${perf.totals.success} ok / ${perf.totals.failed} fail`} accent />
        <StatTile label="Volume handled" value={formatUsd(perf.totals.volume)} sublabel={`${window}-day total`} />
        <StatTile label="Avg latency" value={formatMs(perf.avgLatency)} sublabel="per transaction" />
        <StatTile label="Policy blocks" value={perf.totals.blocked} sublabel="caught by guardrails" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <VolumeChart data={perf.timeseries} />
        <OutcomesChart data={perf.timeseries} />
      </div>

      <LatencyChart data={perf.timeseries} />

      <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium">Per-agent breakdown</h3>
        </div>
        {perf.agentRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No transactions in this window.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <Th>Agent</Th>
                  <Th align="right">Volume</Th>
                  <Th align="right">Success</Th>
                  <Th align="right">Failed</Th>
                  <Th align="right">Blocked</Th>
                  <Th align="right">Success rate</Th>
                  <Th align="right">Avg latency</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perf.agentRows.map((row) => (
                  <tr key={row.agent_id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-5 py-3 font-medium">{row.name}</td>
                    <td className="px-5 py-3 text-right font-mono">{formatUsd(row.volume)}</td>
                    <td className="px-5 py-3 text-right font-mono text-primary">{row.success}</td>
                    <td className="px-5 py-3 text-right font-mono text-destructive">{row.failed}</td>
                    <td className="px-5 py-3 text-right font-mono text-[hsl(var(--chart-4))]">{row.blocked}</td>
                    <td className="px-5 py-3 text-right">
                      <SuccessBar pct={row.successRate} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-muted-foreground">{formatMs(row.avgLatency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return <th className={`px-5 py-2.5 text-${align} font-normal`}>{children}</th>;
}

function SuccessBar({ pct }) {
  return (
    <div className="inline-flex items-center gap-2 justify-end">
      <span className="font-mono text-xs">{(pct * 100).toFixed(0)}%</span>
      <div className="w-16 h-1 rounded-full bg-accent overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}