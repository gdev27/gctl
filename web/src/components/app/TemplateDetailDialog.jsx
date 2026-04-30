import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Bot, Scale, Gavel, ChevronDown } from "lucide-react";

const ROLE_ICONS = { proposer: Bot, critic: Scale, synthesizer: Gavel };
const ROLE_COLORS = { proposer: "text-primary", critic: "text-[hsl(var(--chart-4))]", synthesizer: "text-[hsl(var(--chart-3))]" };

export default function TemplateDetailDialog({ template, open, onOpenChange, onApply }) {
  const [showDebate, setShowDebate] = React.useState(false);

  React.useEffect(() => {
    if (!open) setShowDebate(false);
  }, [open]);

  if (!template) return null;
  const c = template.config || {};
  const isAi = template.source === "ai_debate";
  const debateLog = template.debate_log || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <DialogTitle className="font-serif text-2xl">{template.name}</DialogTitle>
            {isAi && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))] border border-[hsl(var(--chart-3))]/20">
                <Sparkles className="w-2.5 h-2.5" /> ai
              </span>
            )}
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>

        {template.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((t) => (
              <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">{t}</span>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <Row label="Max per tx" value={fmtUsd(c.max_tx_value_usd, "no cap")} />
          <Row label="Daily limit" value={fmtUsd(c.daily_spend_limit_usd, "no cap")} />
          <Row label="Approval above" value={fmtUsd(c.require_human_approval_above_usd, "—")} />
          <Row label="Chains" value={c.allowed_chains?.length ? c.allowed_chains.join(", ") : "any"} />
          <Row label="Tokens" value={c.allowed_tokens?.length ? c.allowed_tokens.join(", ") : "any"} />
        </div>

        {isAi && template.use_case && (
          <div className="rounded-lg border border-[hsl(var(--chart-3))]/20 bg-[hsl(var(--chart-3))]/5 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--chart-3))] mb-1">Original brief</p>
            <p className="text-sm text-foreground/80 italic">"{template.use_case}"</p>
          </div>
        )}

        {isAi && debateLog.length > 0 && (
          <div>
            <button
              onClick={() => setShowDebate((s) => !s)}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-accent/30 text-sm transition-colors"
            >
              <span className="font-medium inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--chart-3))]" />
                View debate transcript ({debateLog.length} turns)
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDebate ? "rotate-180" : ""}`} />
            </button>
            {showDebate && (
              <div className="mt-2 space-y-2">
                {debateLog.map((entry, i) => {
                  const Icon = ROLE_ICONS[entry.role] || Bot;
                  const color = ROLE_COLORS[entry.role] || "text-muted-foreground";
                  return (
                    <div key={i} className="rounded-md border border-border bg-background/50 p-3">
                      <div className={`flex items-center gap-2 mb-2 ${color}`}>
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span className="text-xs font-mono font-medium">{entry.agent}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onApply(template)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Use this template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm gap-3">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-right truncate">{value}</span>
    </div>
  );
}

function fmtUsd(n, fallback = "—") {
  if (n == null || n === "") return fallback;
  if (n === 0) return "$0";
  return `$${Number(n).toLocaleString()}`;
}