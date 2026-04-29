"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { getWorkflows } from "../../lib/api";
import { IndexedWorkflow } from "../../lib/types";
import { StatusPill } from "../../components/status-pill";
import { statusReason } from "../../lib/status";

const filterLabels: Record<string, string> = {
  all: "All states",
  succeeded: "Succeeded",
  running: "Running",
  partial_fill: "Partial Fill",
  timed_out: "Timed Out",
  reverted: "Reverted",
  denied: "Denied",
  cancelled: "Cancelled"
};

const pathLabels: Record<string, string> = {
  safe: "Safe Path",
  escalated: "Escalated Path",
  blocked: "Blocked Path"
};

export default function RunsPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("status") ?? "all";
  const [runs, setRuns] = useState<IndexedWorkflow[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [filter, setFilter] = useState(initialFilter in filterLabels ? initialFilter : "all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getWorkflows();
      setRuns(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
  }, []);

  const visibleRuns = useMemo(() => {
    if (filter === "all") {
      return runs;
    }
    return runs.filter((run) => run.state === filter);
  }, [filter, runs]);

  const failClosedCount = runs.filter((run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted").length;

  return (
    <section className="page">
      <PageHeader
        eyebrow="Run Center"
        title="Execution timeline and triage"
        description="Find risky outcomes fast, understand why they happened, and drill into evidence for each run."
      />
      <div className="card card-tight row-between">
        <label htmlFor="statusFilter" className="field" style={{ marginBottom: 0 }}>
          <span className="field-label">Filter by status</span>
          <select id="statusFilter" className="select" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {Object.entries(filterLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <span className="pill neutral">{visibleRuns.length} matching runs</span>
      </div>

      {dataSource === "fallback" ? (
        <article className="card card-tight">
          <span className="pill warn">Demo fallback data</span>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Run records are currently rendered from fallback snapshots instead of live execution feeds.
          </p>
        </article>
      ) : null}

      <article className="card card-tight row-between">
        <div>
          <h3>Fail-closed outcomes</h3>
          <p className="muted">Denied, reverted, or timed-out runs requiring operator review.</p>
        </div>
        <span className={`pill ${failClosedCount > 0 ? "warn" : "ok"}`}>{failClosedCount}</span>
      </article>

      {loading ? (
        <article className="card">
          <p className="muted">Loading workflow runs...</p>
        </article>
      ) : visibleRuns.length === 0 ? (
        <EmptyState
          title="No runs match this filter"
          description="Try another status filter or verify readiness in onboarding."
          ctaHref="/onboarding"
          ctaLabel="Open readiness checks"
        />
      ) : (
        <article className="card">
          <div className="table-wrap">
            <table aria-label="Runs">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Workflow</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Audit Path</th>
                </tr>
              </thead>
              <tbody>
                {visibleRuns.map((run) => (
                  <tr key={run.runId}>
                    <td className="mono">
                      <Link href={`/runs/${run.runId}`}>{run.runId}</Link>
                    </td>
                    <td>{run.workflowId}</td>
                    <td>{run.pathType ? pathLabels[run.pathType] : "Not classified"}</td>
                    <td><StatusPill state={run.state} /></td>
                    <td className="muted">{statusReason(run.state)}</td>
                    <td className="mono">{run.auditPath}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
