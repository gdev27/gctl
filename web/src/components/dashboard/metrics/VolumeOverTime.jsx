import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};
const axisStyle = { stroke: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-mono)" };

export default function VolumeOverTime({ data, loading }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <h3 className="text-sm font-medium">Volume moved (30d)</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">USD</span>
      </div>
      {loading ? (
        <div className="h-[220px] rounded bg-accent/30 shimmer" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volMetricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`$${Number(v).toLocaleString()}`, "volume"]}
              cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.2 }}
            />
            <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={1.75} fill="url(#volMetricGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}