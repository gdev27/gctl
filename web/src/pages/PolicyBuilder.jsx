import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Shield, FlaskConical } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import PolicyForm from "../components/app/PolicyForm";
import TemplateGallery from "../components/app/TemplateGallery";
import TemplateDetailDialog from "../components/app/TemplateDetailDialog";
import ImpactAnalysisPanel from "../components/policy/ImpactAnalysisPanel";
import ConfirmDialog from "../components/app/ConfirmDialog";
import { SkeletonCard } from "../components/app/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { ReadOnlyBanner } from "../components/app/PermissionGate";

const empty = {
  name: "", description: "", max_tx_value_usd: "", daily_spend_limit_usd: "",
  require_human_approval_above_usd: "", allowed_chains: [], allowed_tokens: [], is_active: true,
};

export default function PolicyBuilder() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const perms = usePermissions();
  const [mode, setMode] = React.useState("list"); // list | new | edit
  const [draft, setDraft] = React.useState(empty);
  const [editingId, setEditingId] = React.useState(null);
  const [previewTemplate, setPreviewTemplate] = React.useState(null);
  const [showImpact, setShowImpact] = React.useState(true);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const applyTemplate = (tpl) => {
    setDraft({ ...empty, ...tpl.config });
    setEditingId(null);
    setMode("new");
    setPreviewTemplate(null);
  };

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: () => base44.entities.Policy.list("-updated_date"),
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.Policy.create(data),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      reset();
      toast({ title: "Policy created", description: `${p?.name || "Policy"} is now enforceable.` });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Policy.update(id, data),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      reset();
      toast({ title: "Policy updated", description: `Changes to ${p?.name || "policy"} are live.` });
    },
  });
  const del = useMutation({
    mutationFn: (id) => base44.entities.Policy.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      toast({ title: "Policy deleted" });
    },
  });

  const reset = () => { setMode("list"); setDraft(empty); setEditingId(null); };

  const startEdit = (p) => { setDraft({ ...empty, ...p }); setEditingId(p.id); setMode("edit"); };

  const submit = () => {
    if (mode === "new") create.mutate(draft);
    else update.mutate({ id: editingId, data: draft });
  };

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// policies"
        title={mode === "list" ? "Policy library" : mode === "new" ? "New policy" : "Edit policy"}
        description="The deterministic guardrails that bind your agents."
        action={
          mode === "list" && perms.canManagePolicies ? (
            <Button onClick={() => { setDraft(empty); setMode("new"); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> New policy
            </Button>
          ) : null
        }
      />
      {mode === "list" && !perms.canManagePolicies && (
        <ReadOnlyBanner message="Only admins can create or edit policies. You can review existing policies below." />
      )}

      <div className="px-6 lg:px-10 py-8 space-y-12">
        {mode === "list" && perms.canManagePolicies && (
          <TemplateGallery onPick={setPreviewTemplate} />
        )}

        {mode === "list" ? (
          isLoading ? (
            <div>
              <h2 className="font-serif text-2xl mb-4">Your policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : policies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/20 p-16 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-serif text-2xl mb-2">No policies yet</p>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                {perms.canManagePolicies
                  ? "Define limits, allowlists, and approval thresholds. Agents bound to a policy can only act within it."
                  : "No policies have been defined in this workspace yet."}
              </p>
              {perms.canManagePolicies && (
                <Button onClick={() => { setDraft(empty); setMode("new"); }} className="bg-primary text-primary-foreground">Create your first policy</Button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-2xl mb-4">Your policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card/40 p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{p.name}</h3>
                        {p.is_active === false && <span className="text-[10px] font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">inactive</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || "—"}</p>
                    </div>
                    {perms.canManagePolicies && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <dl className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
                    <Stat label="Max/tx" value={p.max_tx_value_usd ? `$${p.max_tx_value_usd}` : "—"} />
                    <Stat label="Daily" value={p.daily_spend_limit_usd ? `$${p.daily_spend_limit_usd}` : "—"} />
                    <Stat label="Approval" value={p.require_human_approval_above_usd ? `>$${p.require_human_approval_above_usd}` : "—"} />
                  </dl>
                  {(p.allowed_chains || []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {p.allowed_chains.map((c) => (
                        <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium flex items-center gap-2">
                  {mode === "new" ? "Define policy" : "Edit policy"}
                </h2>
                <button
                  onClick={() => setShowImpact((s) => !s)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 xl:hidden"
                >
                  <FlaskConical className="w-3 h-3" /> {showImpact ? "Hide" : "Show"} impact
                </button>
              </div>
              <PolicyForm value={draft} onChange={setDraft} onSubmit={submit} onCancel={reset} isEdit={mode === "edit"} />
            </div>
            {showImpact && (
              <div className="xl:sticky xl:top-6">
                <ImpactAnalysisPanel draft={draft} />
              </div>
            )}
          </div>
        )}
      </div>

      <TemplateDetailDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(o) => !o && setPreviewTemplate(null)}
        onApply={applyTemplate}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id)}
        title="Delete policy?"
        description={`"${confirmDelete?.name}" will be removed. Agents currently bound to it will lose enforcement until reassigned.`}
        confirmLabel="Delete policy"
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{label}</dt>
      <dd className="text-sm font-mono mt-0.5">{value}</dd>
    </div>
  );
}