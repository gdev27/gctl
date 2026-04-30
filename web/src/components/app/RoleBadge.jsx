import React from "react";
import { Shield, Eye, CheckCircle2 } from "lucide-react";
import { roleMeta } from "@/lib/permissions";

const ICONS = { admin: Shield, approver: CheckCircle2, viewer: Eye };
const STYLES = {
  admin: "text-primary border-primary/30 bg-primary/10",
  approver: "text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2))]/30 bg-[hsl(var(--chart-2))]/10",
  viewer: "text-muted-foreground border-border bg-accent/40",
};

export default function RoleBadge({ role, size = "sm" }) {
  const Icon = ICONS[role] || Eye;
  const meta = roleMeta(role);
  const sizeCls = size === "lg" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded border ${sizeCls} ${STYLES[role] || STYLES.viewer}`}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {meta.label}
    </span>
  );
}