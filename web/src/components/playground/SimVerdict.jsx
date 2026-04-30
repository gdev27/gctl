import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Hourglass } from "lucide-react";

const config = {
  approved: { icon: CheckCircle2, color: "text-primary", border: "border-primary/40", bg: "bg-primary/5", title: "Approved", body: "All policy checks passed. Transaction would execute onchain." },
  blocked: { icon: XCircle, color: "text-destructive", border: "border-destructive/40", bg: "bg-destructive/5", title: "Blocked", body: "Policy denied this action. Nothing would touch the chain." },
  awaiting_approval: { icon: Hourglass, color: "text-[hsl(var(--chart-4))]", border: "border-[hsl(var(--chart-4))]/40", bg: "bg-[hsl(var(--chart-4))]/5", title: "Approval required", body: "Within limits, but above approval threshold. Waiting for human sign-off." },
};

export default function SimVerdict({ status, rule }) {
  const c = config[status];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-lg border ${c.border} ${c.bg} p-5`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${c.color}`} strokeWidth={1.5} />
        <div>
          <p className={`font-medium ${c.color}`}>{c.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{c.body}</p>
          {rule && <p className="text-xs font-mono text-muted-foreground mt-2">rule: {rule}</p>}
        </div>
      </div>
    </motion.div>
  );
}