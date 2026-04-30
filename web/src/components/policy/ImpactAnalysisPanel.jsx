import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { ShieldCheck, ShieldAlert, ShieldX, TrendingDown, FlaskConical } from "lucide-react";
import { analyzeImpact, ruleLabel } from "@/lib/impactAnalysis";
import ChainBadge from "../app/ChainBadge";

export default function ImpactAnalysisPanel({ draft }) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactionsImpact"],
    queryFn: () => base44.entities.Transaction.list("-executed_at", 500),
  });

  const result = React.useMemo(() => analyzeImpact(transactions, draft), [transactions, draft]);

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-accent/20">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <div>
            <h3 className="font-medium text-sm">Impact analysis</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Replays historical transactions against this policy draft.</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {isLoading ? "loading…" : `${result.total} txs replayed`}
        </span>
      </div>

      {result.total === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No historical transactions to replay yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-px bg-border">
            <Tile
              icon={ShieldX}
              label="Would block"
              value={result.blocked}
              sub={`${(result.blockedRate * 100).toFixed(1)}% of all`}
              tone="destructive"
            />
            <Tile
              icon={ShieldAlert}
              label="Need approval"
              value={result.approvalRequired}
              sub="manual sign-off"
              tone="warning"
            />
            <Tile
              icon={ShieldCheck}
              label="Auto-allow"
              value={result.allowed}
              sub="cleared all rules"
              tone="primary"
            />
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">value blocked</span>
              <span className="font-mono text-base">
                <TrendingDown className="w-3.5 h-3.5 inline mr-1.5 text-destructive" />
                ${result.valueBlocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {Object.keys(result.ruleHits).length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">why blocked</p>
                <div className="space-y-1.5">
                  {Object.entries(result.ruleHits)
                    .sort((a, b) => b[1] - a[1])
                    .map(([rule, count]) => {
                      const pct = (count / result.total) * 100;
                      return (
                        <div key={rule}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{ruleLabel[rule] || rule}</span>
                            <span className="font-mono text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-accent/60 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-destructive"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {result.blocked > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">sample blocked transactions</p>
                <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                  {result.results
                    .filter((r) => r.blocked)
                    .slice(0, 8)
                    .map((r, i) => (
                      <div key={i} className="text-xs flex items-center justify-between gap-3 p-2 rounded border border-border bg-background/40">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <ChainBadge chain={r.tx.chain} />
                          <span className="truncate">{r.tx.agent_name || "—"}</span>
                          <span className="font-mono text-muted-foreground">${(r.tx.value_usd || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-mono text-destructive shrink-0">
                          {ruleLabel[r.reasons[0]?.rule] || r.reasons[0]?.rule}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const tones = {
  destructive: "text-destructive",
  warning: "text-[hsl(var(--chart-4))]",
  primary: "text-primary",
};

function Tile({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="bg-card p-5">
      <Icon className={`w-4 h-4 mb-3 ${tones[tone]}`} strokeWidth={2} />
      <div className="font-serif text-3xl">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}