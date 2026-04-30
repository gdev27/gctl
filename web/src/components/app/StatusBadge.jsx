import React from "react";

const config = {
  active: { dot: "bg-primary", text: "text-primary", label: "Active", pulse: true },
  paused: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "Paused" },
  stopped: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", label: "Stopped" },
  error: { dot: "bg-destructive", text: "text-destructive", label: "Error" },
  pending: { dot: "bg-[hsl(var(--chart-4))]", text: "text-[hsl(var(--chart-4))]", label: "Pending", pulse: true },
  success: { dot: "bg-primary", text: "text-primary", label: "Success" },
  failed: { dot: "bg-destructive", text: "text-destructive", label: "Failed" },
  policy_blocked: { dot: "bg-destructive", text: "text-destructive", label: "Blocked" },
  awaiting_approval: { dot: "bg-[hsl(var(--chart-4))]", text: "text-[hsl(var(--chart-4))]", label: "Awaiting", pulse: true },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.paused;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${c.pulse ? "pulse-dot" : ""}`} />
      {c.label}
    </span>
  );
}