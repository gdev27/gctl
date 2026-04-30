import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, Megaphone, AlertTriangle, CornerDownRight, Check, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const kindConfig = {
  status: { icon: MessageSquare, color: "text-muted-foreground", label: "status" },
  verification_request: { icon: ShieldCheck, color: "text-primary", label: "verification request" },
  verification_response: { icon: CornerDownRight, color: "text-[hsl(var(--chart-2))]", label: "response" },
  broadcast: { icon: Megaphone, color: "text-[hsl(var(--chart-3))]", label: "broadcast" },
  alert: { icon: AlertTriangle, color: "text-destructive", label: "alert" },
};

const verificationBadge = {
  pending: { color: "text-[hsl(var(--chart-4))]", icon: Clock, label: "pending" },
  approved: { color: "text-primary", icon: Check, label: "approved" },
  rejected: { color: "text-destructive", icon: X, label: "rejected" },
  expired: { color: "text-muted-foreground", icon: Clock, label: "expired" },
};

export default function MessageItem({ message, agentsById, onRespond, currentAgentId }) {
  const cfg = kindConfig[message.kind] || kindConfig.status;
  const Icon = cfg.icon;
  const targets = (message.target_agent_ids || []).map((id) => agentsById[id]?.name).filter(Boolean);

  const showActions =
    message.kind === "verification_request" &&
    message.verification_status === "pending" &&
    currentAgentId &&
    (message.target_agent_ids || []).includes(currentAgentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-border bg-card/50 p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-md bg-accent/60 border border-border flex items-center justify-center shrink-0 ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{message.agent_name || "system"}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
              {message.verification_status && (
                <VerificationPill status={message.verification_status} />
              )}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
              {message.created_date ? formatDistanceToNow(new Date(message.created_date), { addSuffix: true }) : "—"}
            </span>
          </div>

          {message.subject && <p className="text-sm mt-1.5">{message.subject}</p>}
          {message.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{message.body}</p>}

          {targets.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-muted-foreground">
              <span>→</span>
              {targets.map((n) => (
                <span key={n} className="px-1.5 py-0.5 rounded border border-border bg-background/50">{n}</span>
              ))}
            </div>
          )}

          {message.tx_context?.stages && (
            <TxContextPreview ctx={message.tx_context} />
          )}

          {showActions && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button size="sm" onClick={() => onRespond(message, "approved")} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs">
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRespond(message, "rejected")} className="h-7 text-xs">
                <X className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VerificationPill({ status }) {
  const c = verificationBadge[status];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border ${c.color}`}>
      <Icon className="w-2.5 h-2.5" /> {c.label}
    </span>
  );
}

function TxContextPreview({ ctx }) {
  return (
    <div className="mt-3 rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">multi-stage tx</span>
        <span className="text-xs font-mono">${(ctx.value_usd || 0).toLocaleString()} · {ctx.chain}</span>
      </div>
      <ol className="space-y-1">
        {ctx.stages.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[10px] text-muted-foreground w-4">{(i + 1).toString().padStart(2, "0")}</span>
            <span className="font-medium">{s.label}</span>
            {s.action_type && <span className="font-mono text-[10px] text-muted-foreground">[{s.action_type}]</span>}
            {s.value_usd != null && <span className="ml-auto font-mono text-[10px] text-muted-foreground">${s.value_usd.toLocaleString()}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}