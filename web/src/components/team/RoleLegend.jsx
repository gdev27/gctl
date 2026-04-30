import React from "react";
import { Shield, CheckCircle2, Eye } from "lucide-react";

const items = [
  {
    role: "admin",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    label: "Admin",
    perms: ["Manage agents & policies", "Approve transactions", "Manage team", "Configure alerts"],
  },
  {
    role: "approver",
    icon: CheckCircle2,
    color: "text-[hsl(var(--chart-2))]",
    bg: "bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/20",
    label: "Approver",
    perms: ["Approve / reject transactions", "Pause & resume agents", "Send swarm messages", "Cannot edit policies"],
  },
  {
    role: "viewer",
    icon: Eye,
    color: "text-muted-foreground",
    bg: "bg-accent/40 border-border",
    label: "Viewer",
    perms: ["Track all activity", "Read-only access", "Cannot modify anything", "Cannot approve txs"],
  },
];

export default function RoleLegend() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.role} className={`rounded-xl border p-4 ${it.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <it.icon className={`w-4 h-4 ${it.color}`} strokeWidth={1.75} />
            <span className="font-medium">{it.label}</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {it.perms.map((p) => (
              <li key={p} className="flex items-start gap-1.5">
                <span className="text-foreground/50 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}