import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const TRIGGER_TYPES = [
  { value: "policy_violation", label: "Policy violation detected", needsThreshold: false },
  { value: "balance_below", label: "Wallet balance below threshold", needsThreshold: true, unit: "USD" },
  { value: "tx_value_above", label: "Transaction value above", needsThreshold: true, unit: "USD" },
  { value: "agent_error", label: "Agent enters error state", needsThreshold: false },
  { value: "approval_required", label: "Approval required", needsThreshold: false },
  { value: "daily_limit_reached", label: "Daily limit reached", needsThreshold: true, unit: "% of limit" },
];

const empty = { name: "", trigger_type: "policy_violation", threshold: "", agent_id: "", channel: "in_app", webhook_url: "", is_active: true };

export default function AlertDialog({ open, onOpenChange, alert, agents = [], onSave }) {
  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (alert) setForm({ ...empty, ...alert });
    else setForm(empty);
  }, [alert, open]);

  const trigger = TRIGGER_TYPES.find((t) => t.value === form.trigger_type);

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{alert ? "Edit alert" : "New alert"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="treasury-low-balance" required />
          </Field>

          <Field label="Trigger when">
            <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          {trigger?.needsThreshold && (
            <Field label={`Threshold (${trigger.unit})`}>
              <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: parseFloat(e.target.value) || 0 })} required />
            </Field>
          )}

          <Field label="Apply to agent">
            <Select value={form.agent_id || "_all"} onValueChange={(v) => setForm({ ...form, agent_id: v === "_all" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All agents</SelectItem>
                {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Notification channel">
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">In-app toast</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {form.channel === "webhook" && (
            <Field label="Webhook URL">
              <Input value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} placeholder="https://hooks.slack.com/..." className="font-mono text-xs" />
            </Field>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inactive alerts won't fire.</p>
            </div>
            <Switch checked={form.is_active !== false} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">{alert ? "Save" : "Create"}</Button>
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