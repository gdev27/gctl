import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CheckCircle2 } from "lucide-react";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};
const axisStyle = { stroke: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-mono)" };

export default function SuccessRateTrend({ data, loading }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[hsl(var(--chart-2))]" strokeWidth={1.75} />
          <h3 className="text-sm font-medium">Success rate (30d)</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">% per day</span>
      </div>
      {loading ? (
        <div className="h-[220px] rounded bg-accent/30 shimmer" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, _, p) => [v == null ? "—" : `${v}%`, `success (${p.payload.success}/${p.payload.total})`]} />
            <Line type="monotone" dataKey="successRate" stroke="hsl(var(--chart-2))" strokeWidth={1.75} dot={{ r: 2.5, fill: "hsl(var(--chart-2))" }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}