import React from "react";
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";

const STYLES = {
  healthy: {
    label: "Live",
    icon: ShieldCheck,
    cls: "border-primary/30 bg-primary/5 text-primary",
  },
  degraded: {
    label: "Degraded",
    icon: ShieldAlert,
    cls: "border-[hsl(var(--chart-4))]/30 bg-[hsl(var(--chart-4))]/5 text-[hsl(var(--chart-4))]",
  },
  fallback: {
    label: "Demo",
    icon: ShieldOff,
    cls: "border-destructive/30 bg-destructive/5 text-destructive",
  },
};

export default function SourceBadge({ trustStatus, source, className = "" }) {
  const status = trustStatus || (source === "live" ? "healthy" : "fallback");
  const style = STYLES[status] || STYLES.fallback;
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${style.cls} ${className}`}
      title={`Trust status: ${status}`}
    >
      <Icon className="w-3 h-3" strokeWidth={1.75} />
      {style.label}
    </span>
  );
}
