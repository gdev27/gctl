import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Bot, Scale, Gavel, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/gctlClient";

const STAGES = [
  { agent: "PROPOSER",    role: "Drafting initial policy", icon: Bot, color: "text-primary" },
  { agent: "CRITIC",      role: "Challenging weak points", icon: Scale, color: "text-[hsl(var(--chart-4))]" },
  { agent: "SYNTHESIZER", role: "Reconciling and finalizing", icon: Gavel, color: "text-[hsl(var(--chart-3))]" },
];

const PRESETS = [
  "A treasury agent that rebalances stablecoins on Base, low risk",
  "A market-maker bot trading ETH/USDC with strict daily caps",
  "An NFT minting agent on Ethereum that pays gas in ETH",
  "A payroll agent that pays vendors in USDC monthly on Base",
];

export default function AIDebateDialog({ open, onOpenChange, onComplete }) {
  const [useCase, setUseCase] = React.useState("");
  const [openaiKey, setOpenaiKey] = React.useState("");
  const [openaiModel, setOpenaiModel] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [activeStage, setActiveStage] = React.useState(-1);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setUseCase("");
      setOpenaiKey("");
      setOpenaiModel("");
      setRunning(false);
      setActiveStage(-1);
      setError(null);
    }
  }, [open]);

  const start = async () => {
    if (!useCase.trim()) return;
    setRunning(true); setError(null); setActiveStage(0);

    // animate stage progression while the function runs
    const stageTimer = setInterval(() => {
      setActiveStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 4500);

    try {
      const payload = { useCase };
      const k = openaiKey.trim();
      if (k.length > 0) {
        payload.openaiApiKey = k;
        const m = openaiModel.trim();
        if (m.length > 0) payload.openaiModel = m;
      }
      const res = await base44.functions.invoke("debate-policy", payload);
      clearInterval(stageTimer);
      setActiveStage(STAGES.length); // all done
      const template = res?.data?.template;
      if (!template) throw new Error("No template returned");
      const persisted = await base44.entities.PolicyTemplate.create(template);
      onComplete?.(persisted);
      onOpenChange(false);
    } catch (e) {
      clearInterval(stageTimer);
      setError(e?.response?.data?.error || e.message || "Debate failed");
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !running && onOpenChange(o)}>
      <DialogContent className="bg-card border-border max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[hsl(var(--chart-3))]/10 shrink-0">
              <Sparkles className="w-4 h-4 text-[hsl(var(--chart-3))]" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-serif text-xl">Generate via multi-agent debate</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Three AI agents — Proposer, Critic, Synthesizer — debate your use case and produce a tailored policy template.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!running && (
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Describe your use case</label>
              <Textarea
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. an agent that rebalances treasury stables across L2s, max $5k per move, only USDC"
                rows={4}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Or pick a starting point</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setUseCase(p)}
                    className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:border-primary/40 hover:text-foreground text-muted-foreground transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Collapsible className="rounded-md border border-border bg-background/40">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <span>Optional: your OpenAI key (BYOK)</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 border-t border-border px-3 pb-3 pt-2">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Sent only to this site&apos;s API over HTTPS for this run; not stored on the server. Leave empty to use the host&apos;s configured key, or deterministic output if none is set.
                </p>
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">API key</label>
                  <Input
                    type="password"
                    autoComplete="off"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-…"
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Model (optional)</label>
                  <Input
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            {error && (
              <div className="text-xs text-destructive font-mono p-2 rounded bg-destructive/5 border border-destructive/20">
                {error}
              </div>
            )}
          </div>
        )}

        {running && (
          <div className="space-y-3 py-4">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeStage === i;
              const isDone = activeStage > i;
              return (
                <div
                  key={s.agent}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isActive ? "border-primary/40 bg-primary/5" :
                    isDone ? "border-border bg-background/50 opacity-60" :
                    "border-border bg-background/20 opacity-40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-md border border-border flex items-center justify-center ${s.color}`}>
                    {isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium font-mono">{s.agent}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </div>
                  {isDone && <span className="text-[10px] font-mono text-primary">done</span>}
                  {isActive && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[10px] font-mono text-primary"
                      >
                        thinking…
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground text-center pt-2">This usually takes 20-40 seconds. Don't close this window.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            {running ? "Running…" : "Cancel"}
          </Button>
          {!running && (
            <Button onClick={start} disabled={!useCase.trim()} className="gap-2 bg-[hsl(var(--chart-3))] text-background hover:bg-[hsl(var(--chart-3))]/90">
              <Sparkles className="w-3.5 h-3.5" /> Start debate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}