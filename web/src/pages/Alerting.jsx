import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Bell, Zap } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import AlertDialog from "../components/app/AlertDialog";
import AlertEventList from "../components/app/AlertEventList";
import ConfirmDialog from "../components/app/ConfirmDialog";
import { useAlertToast } from "@/lib/alertContext";

const TRIGGER_LABELS = {
  policy_violation: "Policy violation",
  balance_below: "Balance below",
  tx_value_above: "Tx value above",
  agent_error: "Agent error",
  approval_required: "Approval required",
  daily_limit_reached: "Daily limit reached",
};

const SAMPLE_FIRES = [
  { trigger_type: "policy_violation", severity: "critical", title: "Policy blocked", message: "Agent attempted swap to non-allowlisted contract.", agent: "treasury-rebalancer" },
  { trigger_type: "balance_below", severity: "warning", title: "Low balance", message: "Wallet balance dropped below $5,000 threshold.", agent: "yield-router" },
  { trigger_type: "approval_required", severity: "info", title: "Approval needed", message: "$12,000 bridge transaction is waiting for sign-off.", agent: "bridging-ops" },
  { trigger_type: "agent_error", severity: "critical", title: "Agent in error state", message: "RPC connection lost during execution.", agent: "mm-experimental" },
];

export default function Alerting() {
  const qc = useQueryClient();
  const { push } = useAlertToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-updated_date"),
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list(),
  });
  const { data: events = [] } = useQuery({
    queryKey: ["alertEvents"],
    queryFn: () => base44.entities.AlertEvent.list("-created_date", 50),
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.Alert.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); setOpen(false); setEditing(null); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); setOpen(false); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id) => base44.entities.Alert.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
  const ack = useMutation({
    mutationFn: (e) => base44.entities.AlertEvent.update(e.id, { ...e, acknowledged: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertEvents"] }),
  });

  const save = (data) => {
    if (editing) update.mutate({ id: editing.id, data });
    else create.mutate(data);
  };

  const toggleActive = (a) => {
    update.mutate({ id: a.id, data: { ...a, is_active: !a.is_active } });
  };

  const fireTest = async (alert) => {
    const sample = SAMPLE_FIRES[Math.floor(Math.random() * SAMPLE_FIRES.length)];
    push({
      severity: sample.severity,
      title: alert.name,
      message: sample.message,
      agent: sample.agent,
    });
    await base44.entities.AlertEvent.create({
      alert_id: alert.id,
      alert_name: alert.name,
      trigger_type: alert.trigger_type,
      agent_name: sample.agent,
      severity: sample.severity,
      message: sample.message,
    });
    update.mutate({ id: alert.id, data: { ...alert, last_triggered_at: new Date().toISOString(), trigger_count: (alert.trigger_count || 0) + 1 } });
    qc.invalidateQueries({ queryKey: ["alertEvents"] });
  };

  const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));
  const unackCount = events.filter((e) => !e.acknowledged).length;

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// alerting"
        title="Alerts & notifications"
        description="Custom triggers that fire when your agents misbehave or thresholds breach."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> New alert
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Alerts list */}
        <div>
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Configured triggers <span className="text-xs font-mono text-muted-foreground">({alerts.length})</span>
          </h2>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/20 p-12 text-center">
              <Bell className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-medium">No alerts configured</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Define a trigger to get notified the moment something matters.</p>
              <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground" size="sm">Create alert</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-card/40 p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{a.name}</p>
                        {a.is_active === false && <span className="text-[10px] font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">off</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-mono text-muted-foreground">
                        <span>{TRIGGER_LABELS[a.trigger_type]}</span>
                        {a.threshold ? <span>· threshold: {a.threshold}</span> : null}
                        <span>· {a.agent_id ? agentById[a.agent_id]?.name || "—" : "all agents"}</span>
                        <span>· {a.channel}</span>
                        {a.trigger_count > 0 && <span>· fired {a.trigger_count}x</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch checked={a.is_active !== false} onCheckedChange={() => toggleActive(a)} />
                      <button onClick={() => fireTest(a)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors" title="Fire test">
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditing(a); setOpen(true); }} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirmDelete(a)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="font-medium mb-4 flex items-center gap-2">
            History
            {unackCount > 0 && <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">{unackCount} unack</span>}
          </h2>
          <AlertEventList events={events} onAcknowledge={(e) => ack.mutate(e)} />
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen} alert={editing} agents={agents} onSave={save} />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id)}
        title="Delete alert?"
        description={`"${confirmDelete?.name}" will stop firing. Past events stay in history.`}
        confirmLabel="Delete alert"
      />
    </div>
  );
}