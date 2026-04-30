import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Sparkles } from "lucide-react";

const CHAINS = ["ethereum", "base", "arbitrum", "optimism", "polygon", "solana"];
const ACTIONS = ["transfer", "swap", "approve", "stake", "unstake", "bridge", "contract_call"];

const PRESETS = [
  { label: "Small swap", tx: { chain: "base", action_type: "swap", value_usd: 250, token_symbol: "USDC", to_address: "0x4200000000000000000000000000000000000006" } },
  { label: "Above approval", tx: { chain: "base", action_type: "transfer", value_usd: 1500, token_symbol: "USDC", to_address: "0x9876543210fedcba9876543210fedcba98765432" } },
  { label: "Wrong chain", tx: { chain: "polygon", action_type: "swap", value_usd: 100, token_symbol: "MATIC", to_address: "0x0000000000000000000000000000000000001010" } },
  { label: "Over max tx", tx: { chain: "base", action_type: "swap", value_usd: 9999, token_symbol: "ETH", to_address: "0x4200000000000000000000000000000000000006" } },
];

export default function TxForm({ value, onChange, onRun, onPreset, disabled }) {
  const update = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onPreset(p.tx)}
              className="text-xs font-mono px-2.5 py-1 rounded border border-border bg-background hover:border-primary/40 hover:text-foreground text-muted-foreground transition-colors inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Chain">
          <Select value={value.chain} onValueChange={(v) => update("chain", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CHAINS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Action">
          <Select value={value.action_type} onValueChange={(v) => update("action_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Value (USD)">
          <Input type="number" value={value.value_usd} onChange={(e) => update("value_usd", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Token symbol">
          <Input value={value.token_symbol} onChange={(e) => update("token_symbol", e.target.value)} placeholder="USDC" />
        </Field>
      </div>
      <Field label="To address">
        <Input value={value.to_address} onChange={(e) => update("to_address", e.target.value)} placeholder="0x…" className="font-mono text-xs" />
      </Field>

      <Button onClick={onRun} disabled={disabled} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11">
        <Play className="w-4 h-4" /> Simulate
      </Button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}