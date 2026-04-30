import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Receipt, X, Check, Ban, FilterX } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/app/PageHeader";
import StatusBadge from "../components/app/StatusBadge";
import ChainBadge from "../components/app/ChainBadge";
import { SkeletonRow } from "../components/app/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

const STATUSES = ["all", "success", "pending", "failed", "policy_blocked", "awaiting_approval"];

export default function Explorer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const perms = usePermissions();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [chain, setChain] = React.useState("all");
  const [selected, setSelected] = React.useState(null);

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-executed_at", 200),
  });

  const decideMut = useMutation({
    mutationFn: ({ tx, decision }) =>
      base44.entities.Transaction.update(tx.id, {
        ...tx,
        status: decision === "approve" ? "success" : "policy_blocked",
        policy_check: {
          ...(tx.policy_check || {}),
          passed: decision === "approve",
          rule_triggered: decision === "approve" ? "human_approval" : "human_rejection",
          reason: decision === "approve" ? "Approved by reviewer" : "Rejected by reviewer",
        },
        executed_at: new Date().toISOString(),
      }),
    onSuccess: (updated, vars) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setSelected(updated);
      toast({
        title: vars.decision === "approve" ? "Transaction approved" : "Transaction rejected",
        description: `${vars.tx.agent_name || "Agent"} · $${(vars.tx.value_usd || 0).toLocaleString()}`,
      });
    },
  });

  const filtered = txs.filter((t) => {
    if (status !== "all" && t.status !== status) return false;
    if (chain !== "all" && t.chain !== chain) return false;
    if (q) {
      const s = q.toLowerCase();
      return [t.tx_hash, t.agent_name, t.from_address, t.to_address, t.token_symbol, t.action_type].some((v) => (v || "").toLowerCase().includes(s));
    }
    return true;
  });

  const chains = Array.from(new Set(txs.map((t) => t.chain).filter(Boolean)));
  const hasFilters = q !== "" || status !== "all" || chain !== "all";
  const clearFilters = () => { setQ(""); setStatus("all"); setChain("all"); };

  const showLoading = isLoading;
  const showTrulyEmpty = !isLoading && txs.length === 0;
  const showNoMatches = !isLoading && txs.length > 0 && filtered.length === 0;

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// explorer"
        title="Transaction explorer"
        description="Every action your agents have proposed, allowed, or denied."
      />

      <div className="px-6 lg:px-10 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hash, agent, address..." className="pl-9 font-mono text-sm bg-card" />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all chains</SelectItem>
              {chains.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <FilterX className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
          {!showLoading && !showTrulyEmpty && (
            <span className="ml-auto text-xs font-mono text-muted-foreground">
              {filtered.length} / {txs.length}
            </span>
          )}
        </div>

        {/* Table + detail */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
            {showLoading ? (
              <table className="w-full">
                <thead className="bg-background/40 border-b border-border">
                  <tr>
                    <Th>When</Th><Th>Agent</Th><Th>Action</Th><Th>Chain</Th><Th>Value</Th><Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
                </tbody>
              </table>
            ) : showTrulyEmpty ? (
              <div className="p-16 text-center">
                <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Once your agents start running, every action will appear here.</p>
              </div>
            ) : showNoMatches ? (
              <div className="p-16 text-center">
                <FilterX className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-medium">No matching transactions</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Try a broader search or clear the active filters.</p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
                  <FilterX className="w-3.5 h-3.5" /> Clear filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead className="bg-background/40 border-b border-border">
                    <tr>
                      <Th>When</Th><Th>Agent</Th><Th>Action</Th><Th>Chain</Th><Th>Value</Th><Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={`cursor-pointer hover:bg-accent/30 transition-colors ${selected?.id === t.id ? "bg-accent/40" : ""}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {t.executed_at ? format(new Date(t.executed_at), "MMM d HH:mm:ss") : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">{t.agent_name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {t.action_type || "—"}
                          {t.token_symbol && <span className="text-muted-foreground"> · {t.token_symbol}</span>}
                        </td>
                        <td className="px-4 py-3"><ChainBadge chain={t.chain} /></td>
                        <td className="px-4 py-3 font-mono text-sm">${(t.value_usd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail */}
          <aside className="rounded-xl border border-border bg-card/40 p-5 h-fit xl:sticky xl:top-6">
            {selected ? (
              <TxDetail
                tx={selected}
                canApprove={perms.canApproveTransactions}
                onApprove={() => decideMut.mutate({ tx: selected, decision: "approve" })}
                onReject={() => decideMut.mutate({ tx: selected, decision: "reject" })}
                isPending={decideMut.isPending}
              />
            ) : (
              <div className="text-center py-10">
                <Receipt className="w-6 h-6 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">Select a transaction to inspect</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{children}</th>;
}

function TxDetail({ tx, canApprove, onApprove, onReject, isPending }) {
  const needsApproval = tx.status === "awaiting_approval";
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{tx.action_type}</p>
          <p className="font-serif text-2xl mt-1">${(tx.value_usd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {needsApproval && (
        <div className="rounded-md border border-[hsl(var(--chart-4))]/30 bg-[hsl(var(--chart-4))]/5 p-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--chart-4))] mb-2">Awaiting human approval</p>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            This transaction exceeds the policy auto-approval threshold. Review the details below before deciding.
          </p>
          {canApprove ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={onApprove} disabled={isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                <Check className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject} disabled={isPending} className="flex-1 gap-1.5">
                <Ban className="w-3.5 h-3.5" /> Reject
              </Button>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-muted-foreground border border-dashed border-border rounded p-2 text-center">
              Viewers cannot approve transactions. Ask an admin or approver.
            </p>
          )}
        </div>
      )}

      <DetailRow label="Agent" value={tx.agent_name || "—"} mono />
      <DetailRow label="Chain" value={<ChainBadge chain={tx.chain} />} />
      <DetailRow label="Token" value={`${tx.token_amount || 0} ${tx.token_symbol || ""}`} mono />
      <DetailRow label="From" value={short(tx.from_address)} mono />
      <DetailRow label="To" value={short(tx.to_address)} mono />
      <DetailRow label="Tx hash" value={
        tx.tx_hash ? (
          <a href={`https://etherscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-mono">
            {short(tx.tx_hash)} <ExternalLink className="w-3 h-3" />
          </a>
        ) : "—"
      } />
      <DetailRow label="Block" value={tx.block_number || "—"} mono />
      <DetailRow label="Gas (USD)" value={tx.gas_used_usd ? `$${tx.gas_used_usd.toFixed(4)}` : "—"} mono />

      {tx.policy_check && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Policy check</p>
          <div className="rounded-md border border-border bg-background/50 p-3">
            <p className={`text-sm font-mono ${tx.policy_check.passed ? "text-primary" : "text-destructive"}`}>
              {tx.policy_check.passed ? "✓ passed" : `✗ ${tx.policy_check.rule_triggered || "denied"}`}
            </p>
            {tx.policy_check.reason && <p className="text-xs text-muted-foreground mt-1.5">{tx.policy_check.reason}</p>}
          </div>
        </div>
      )}

      {tx.reasoning && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Agent reasoning</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{tx.reasoning}</p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground shrink-0 mt-0.5">{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function short(addr) {
  if (!addr) return "—";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}