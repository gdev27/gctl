import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function TopAgents({ data, loading }) {
  const max = data[0]?.volume || 1;

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[hsl(var(--chart-4))]" strokeWidth={1.75} />
          <h3 className="text-sm font-medium">Top performing agents</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">by volume</span>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded bg-accent/30 shimmer" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No agent activity yet.</div>
      ) : (
        <ul className="space-y-3">
          {data.map((a, i) => {
            const pct = (a.volume / max) * 100;
            return (
              <li key={a.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-muted-foreground w-4">#{i + 1}</span>
                    <span className="truncate">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {(a.successRate * 100).toFixed(0)}% · {a.total} tx
                    </span>
                    <span className="font-mono">${a.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-accent/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                    className="h-full bg-primary"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}