import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import StatusBadge from "../components/app/StatusBadge";
import ChainBadge from "../components/app/ChainBadge";
import AgentDialog from "../components/app/AgentDialog";
import ConfirmDialog from "../components/app/ConfirmDialog";
import UnconstrainedBadge from "../components/app/UnconstrainedBadge";
import { SkeletonRow } from "../components/app/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { ReadOnlyBanner } from "../components/app/PermissionGate";

export default function Agents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const perms = usePermissions();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list("-updated_date"),
  });
  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: () => base44.entities.Policy.list(),
  });

  const policyById = Object.fromEntries(policies.map((p) => [p.id, p]));

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: (a) => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      setOpen(false); setEditing(null);
      toast({ title: "Agent created", description: `${a?.name || "Agent"} is ready to bind to a policy.` });
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Agent.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      setOpen(false); setEditing(null);
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Agent.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Agent deleted", description: "It will no longer execute." });
    },
  });

  const save = (data) => {
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const toggleStatus = (a) => {
    const nextStatus = a.status === "active" ? "paused" : "active";
    updateMut.mutate({ id: a.id, data: { ...a, status: nextStatus, last_run_at: new Date().toISOString() } });
    toast({ title: nextStatus === "active" ? "Agent resumed" : "Agent paused", description: a.name });
  };

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// agents"
        title="Agents"
        description="Autonomous workers, each bound to a policy."
        action={
          perms.canManageAgents ? (
            <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> New agent
            </Button>
          ) : null
        }
      />
      {!perms.canManageAgents && !perms.canRunAgents && (
        <ReadOnlyBanner message="Viewers can track agent activity but cannot create, edit, or pause agents." />
      )}

      <div className="px-6 lg:px-10 py-8">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
            <table className="w-full">
              <thead className="bg-background/40 border-b border-border">
                <tr>
                  <Th>Name</Th><Th>Status</Th><Th>Chain</Th><Th>Policy</Th><Th>Volume</Th><Th>Last run</Th><Th />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
              </tbody>
            </table>
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/20 p-16 text-center">
            <p className="font-serif text-2xl mb-2">No agents yet</p>
            <p className="text-muted-foreground text-sm mb-6">
              {perms.canManageAgents ? "Spin up your first policy-constrained agent." : "No agents have been deployed in this workspace yet."}
            </p>
            {perms.canManageAgents && (
              <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">Create agent</Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
            <table className="w-full">
              <thead className="bg-background/40 border-b border-border">
                <tr>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Chain</Th>
                  <Th>Policy</Th>
                  <Th>Volume</Th>
                  <Th>Last run</Th>
                  <Th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-xs">{a.objective || "—"}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-4"><ChainBadge chain={a.chain} /></td>
                    <td className="px-5 py-4 text-sm">
                      {policyById[a.policy_id]?.name || <UnconstrainedBadge />}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">${(a.total_value_moved || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                      {a.last_run_at ? formatDistanceToNow(new Date(a.last_run_at), { addSuffix: true }) : "never"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {perms.canRunAgents && (
                          <IconBtn onClick={() => toggleStatus(a)} title={a.status === "active" ? "Pause" : "Resume"}>
                            {a.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </IconBtn>
                        )}
                        {perms.canManageAgents && (
                          <>
                            <IconBtn onClick={() => { setEditing(a); setOpen(true); }} title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </IconBtn>
                            <IconBtn onClick={() => setConfirmDelete(a)} title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </IconBtn>
                          </>
                        )}
                        {!perms.canManageAgents && !perms.canRunAgents && (
                          <span className="text-[10px] font-mono text-muted-foreground">read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AgentDialog open={open} onOpenChange={setOpen} agent={editing} policies={policies} onSave={save} />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete.id)}
        title="Delete agent?"
        description={`"${confirmDelete?.name}" will stop executing immediately. Its transaction history is preserved.`}
        confirmLabel="Delete agent"
      />
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{children}</th>;
}
function IconBtn({ children, ...props }) {
  return <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" {...props}>{children}</button>;
}