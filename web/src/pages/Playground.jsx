import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Beaker } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import TxForm from "../components/playground/TxForm";
import SimStep from "../components/playground/SimStep";
import SimVerdict from "../components/playground/SimVerdict";
import { simulatePolicy } from "@/lib/policyEngine";

const defaultTx = {
  chain: "base",
  action_type: "swap",
  value_usd: 250,
  token_symbol: "USDC",
  to_address: "0x4200000000000000000000000000000000000006",
};

export default function Playground() {
  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: () => base44.entities.Policy.list(),
  });

  const [policyId, setPolicyId] = React.useState("");
  const [tx, setTx] = React.useState(defaultTx);
  const [dailySpent, setDailySpent] = React.useState(0);
  const [result, setResult] = React.useState(null);
  const [runningStep, setRunningStep] = React.useState(-1);

  React.useEffect(() => {
    if (!policyId && policies.length > 0) setPolicyId(policies[0].id);
  }, [policies, policyId]);

  const policy = policies.find((p) => p.id === policyId);

  const run = async () => {
    if (!policy) return;
    const sim = simulatePolicy(policy, tx, dailySpent);
    setResult({ ...sim, settled: false });
    setRunningStep(0);

    // Step-by-step animation
    for (let i = 0; i < sim.steps.length; i++) {
      setRunningStep(i);
      await new Promise((r) => setTimeout(r, 380));
    }
    setRunningStep(sim.steps.length);
    setResult({ ...sim, settled: true });
  };

  const stepState = (i) => {
    if (!result) return "pending";
    if (i < runningStep) return "done";
    if (i === runningStep) return "running";
    return "pending";
  };

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// playground"
        title="Simulation playground"
        description="Test agent actions against any policy before they touch a real chain."
      />

      <div className="px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* LEFT: configuration */}
          <div className="rounded-xl border border-border bg-card/40 p-6 space-y-6 h-fit">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Beaker className="w-4 h-4 text-primary" />
                <h2 className="font-medium">Configure</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Policy</Label>
                  <Select value={policyId} onValueChange={setPolicyId}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a policy" /></SelectTrigger>
                    <SelectContent>
                      {policies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} {p.is_active === false && "(inactive)"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Already spent today (USD)</Label>
                  <Input type="number" value={dailySpent} onChange={(e) => setDailySpent(parseFloat(e.target.value) || 0)} className="mt-1.5" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Proposed transaction</p>
              <TxForm
                value={tx}
                onChange={setTx}
                onRun={run}
                onPreset={(p) => { setTx({ ...defaultTx, ...p }); setResult(null); }}
                disabled={!policy}
              />
            </div>
          </div>

          {/* RIGHT: visualizer */}
          <div className="space-y-4">
            {policy && (
              <div className="rounded-xl border border-border bg-card/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Active policy</p>
                    <p className="font-medium mt-0.5">{policy.name}</p>
                  </div>
                  <div className="text-right text-xs font-mono text-muted-foreground space-y-0.5">
                    <p>max-tx: ${policy.max_tx_value_usd || "∞"}</p>
                    <p>daily: ${policy.daily_spend_limit_usd || "∞"}</p>
                    <p>approval: ${policy.require_human_approval_above_usd || "∞"}+</p>
                  </div>
                </div>
              </div>
            )}

            {!result ? (
              <EmptyVisualizer />
            ) : (
              <div className="rounded-xl border border-border bg-card/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Validation pipeline</h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.min(runningStep + 1, result.steps.length)}/{result.steps.length} checks
                  </span>
                </div>
                <div className="space-y-2">
                  {result.steps.map((s, i) => (
                    <SimStep key={s.key} step={s} index={i} state={stepState(i)} />
                  ))}
                </div>
                {result.settled && (
                  <div className="mt-5">
                    <SimVerdict status={result.status} rule={result.rule} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyVisualizer() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/20 p-16 text-center">
      <Beaker className="w-8 h-8 text-primary mx-auto mb-3" strokeWidth={1.5} />
      <p className="font-serif text-2xl">Simulate before you ship</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
        Pick a policy, craft a hypothetical transaction, and watch each guardrail evaluate it in real time.
      </p>
    </div>
  );
}