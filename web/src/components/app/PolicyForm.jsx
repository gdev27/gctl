import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";

const CHAINS = ["ethereum", "base", "arbitrum", "optimism", "polygon", "solana"];

export default function PolicyForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  const update = (k, v) => onChange({ ...value, [k]: v });

  const toggleChain = (c) => {
    const set = new Set(value.allowed_chains || []);
    set.has(c) ? set.delete(c) : set.add(c);
    update("allowed_chains", Array.from(set));
  };

  const addToken = (e) => {
    e.preventDefault();
    const v = e.target.token.value.trim();
    if (!v) return;
    update("allowed_tokens", [...(value.allowed_tokens || []), v]);
    e.target.token.value = "";
  };

  const removeToken = (i) => {
    update("allowed_tokens", (value.allowed_tokens || []).filter((_, idx) => idx !== i));
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="rounded-xl border border-border bg-card/40 divide-y divide-border"
    >
      <Section title="Identity" subtitle="Name and describe this policy.">
        <Field label="Name">
          <Input value={value.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="treasury-v2" required />
        </Field>
        <Field label="Description">
          <Textarea rows={2} value={value.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Conservative limits for treasury operations" />
        </Field>
      </Section>

      <Section title="Spending limits" subtitle="Hard caps enforced before any onchain action.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Max per tx (USD)">
            <Input type="number" value={value.max_tx_value_usd || ""} onChange={(e) => update("max_tx_value_usd", parseFloat(e.target.value) || 0)} placeholder="500" />
          </Field>
          <Field label="Daily limit (USD)">
            <Input type="number" value={value.daily_spend_limit_usd || ""} onChange={(e) => update("daily_spend_limit_usd", parseFloat(e.target.value) || 0)} placeholder="2000" />
          </Field>
          <Field label="Approval above (USD)">
            <Input type="number" value={value.require_human_approval_above_usd || ""} onChange={(e) => update("require_human_approval_above_usd", parseFloat(e.target.value) || 0)} placeholder="1000" />
          </Field>
        </div>
      </Section>

      <Section title="Chain allowlist" subtitle="Agent can only act on selected chains.">
        <div className="flex flex-wrap gap-2">
          {CHAINS.map((c) => {
            const active = (value.allowed_chains || []).includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggleChain(c)}
                className={`px-3 py-1.5 rounded-md text-sm font-mono border transition-colors ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Token allowlist" subtitle="Symbols or addresses. Empty = any.">
        <div className="flex flex-wrap gap-2 mb-3">
          {(value.allowed_tokens || []).map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border border-border bg-accent/40">
              {t}
              <button type="button" onClick={() => removeToken(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={addToken} className="flex gap-2">
          <Input name="token" placeholder="USDC, ETH, 0x..." className="flex-1" />
          <Button type="submit" variant="outline" size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</Button>
        </form>
      </Section>

      <Section title="Status">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground mt-0.5">Inactive policies are not enforced.</p>
          </div>
          <Switch checked={value.is_active !== false} onCheckedChange={(v) => update("is_active", v)} />
        </div>
      </Section>

      <div className="px-6 py-4 flex justify-end gap-2 bg-background/30">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isEdit ? "Save policy" : "Create policy"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="px-6 py-6">
      <div className="mb-4">
        <h3 className="font-medium">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5 mb-4 last:mb-0">
      <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}