import React from "react";
import { motion } from "framer-motion";
import { Fuel } from "lucide-react";

const chainColors = {
  ethereum: "#627EEA",
  base: "#0052FF",
  arbitrum: "#28A0F0",
  optimism: "#FF0420",
  polygon: "#8247E5",
  solana: "#14F195",
  unknown: "hsl(var(--muted-foreground))",
};

export default function GasDistribution({ data, loading }) {
  const max = data[0]?.gas || 1;

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-[hsl(var(--chart-3))]" strokeWidth={1.75} />
          <h3 className="text-sm font-medium">Gas spend by chain</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">USD</span>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 rounded bg-accent/30 shimmer" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No gas data yet.</div>
      ) : (
        <ul className="space-y-3">
          {data.map((g, i) => {
            const pct = (g.gas / max) * 100;
            return (
              <li key={g.chain}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: chainColors[g.chain] || chainColors.unknown }} />
                    <span className="font-mono">{g.chain}</span>
                    <span className="text-[10px] text-muted-foreground">· {g.count} tx</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">avg ${g.avg.toFixed(4)}</span>
                    <span className="font-mono">${g.gas.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-accent/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                    className="h-full"
                    style={{ background: chainColors[g.chain] || chainColors.unknown }}
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