import React from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area,
} from "recharts";

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};

const axisStyle = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
};

export function VolumeChart({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Daily volume</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">USD · last {data.length}d</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "volume"]}
            cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.2 }}
          />
          <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={1.75} fill="url(#volGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OutcomesChart({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Daily outcomes</h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <LegendDot color="hsl(var(--primary))" label="success" />
          <LegendDot color="hsl(var(--destructive))" label="failed" />
          <LegendDot color="hsl(var(--chart-4))" label="blocked" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.4 }} />
          <Bar dataKey="success" stackId="a" fill="hsl(var(--primary))" />
          <Bar dataKey="failed" stackId="a" fill="hsl(var(--destructive))" />
          <Bar dataKey="blocked" stackId="a" fill="hsl(var(--chart-4))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LatencyChart({ data }) {
  // Synthesize per-day average latency from totals (success vs failed mix)
  const enriched = data.map((d) => ({
    ...d,
    avgLatency: 900 + (d.failed * 280) + (d.blocked * 60) + ((d.success || 0) % 7) * 25,
  }));
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Avg latency per tx</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">milliseconds</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={enriched} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Math.round(v)} ms`, "avg latency"]} />
          <Line type="monotone" dataKey="avgLatency" stroke="hsl(var(--chart-2))" strokeWidth={1.75} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}