import React from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, Loader2 } from "lucide-react";

export default function SimStep({ step, index, state }) {
  // state: "pending" | "running" | "done"
  const isApproval = step.requiresApproval;
  const passed = step.passed;

  const tone = state === "pending"
    ? "border-border bg-card/30 opacity-50"
    : passed && !isApproval
    ? "border-primary/40 bg-card"
    : isApproval
    ? "border-[hsl(var(--chart-4))]/50 bg-card"
    : "border-destructive/50 bg-card";

  const Icon = state === "running" ? Loader2 : passed && !isApproval ? Check : isApproval ? Clock : X;
  const iconColor = state === "running"
    ? "text-muted-foreground"
    : passed && !isApproval
    ? "text-primary"
    : isApproval
    ? "text-[hsl(var(--chart-4))]"
    : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${tone}`}
    >
      <div className={`mt-0.5 w-6 h-6 rounded-full border border-current flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className={`w-3.5 h-3.5 ${state === "running" ? "animate-spin" : ""}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{step.label}</p>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">step {index + 1}</span>
        </div>
        {state !== "pending" && (
          <p className="text-xs text-muted-foreground font-mono mt-1">{step.detail}</p>
        )}
      </div>
    </motion.div>
  );
}