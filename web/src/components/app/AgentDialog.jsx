import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CHAINS = ["ethereum", "base", "arbitrum", "optimism", "polygon", "solana"];

export default function AgentDialog({ open, onOpenChange, agent, policies = [], onSave }) {
  const [form, setForm] = React.useState({
    name: "", description: "", objective: "", chain: "base", model: "gpt-4o", policy_id: "", status: "paused",
  });

  React.useEffect(() => {
    if (agent) setForm({ ...form, ...agent });
    else setForm({ name: "", description: "", objective: "", chain: "base", model: "gpt-4o", policy_id: "", status: "paused" });
    // eslint-disable-next-line
  }, [agent, open]);

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{agent ? "Edit agent" : "New agent"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="treasury-rebalancer" required />
          </Field>
          <Field label="Objective">
            <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="Maintain 60/40 USDC/ETH split with daily rebalance" rows={2} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Chain">
              <Select value={form.chain} onValueChange={(v) => setForm({ ...form, chain: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHAINS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Model">
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="claude-sonnet-4">claude-sonnet-4</SelectItem>
                  <SelectItem value="gemini-2.5-pro">gemini-2.5-pro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Policy">
            <Select value={form.policy_id || "_none"} onValueChange={(v) => setForm({ ...form, policy_id: v === "_none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No policy (will run unconstrained ⚠)</SelectItem>
                {policies.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">{agent ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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