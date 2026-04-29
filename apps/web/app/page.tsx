"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../components/empty-state";
import { PageHeader } from "../components/page-header";
import { getOverview, getWorkflows } from "../lib/api";
import { OpsOverview, IndexedWorkflow } from "../lib/types";
import { StatusPill } from "../components/status-pill";
import { statusReason } from "../lib/status";

const defaultOverview: OpsOverview = {
  policyCount: 0,
  activePolicies: 0,
  workflowCount: 0,
  failClosedAlerts: 0,
  deterministicSuccessRate: 0
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<OpsOverview>(defaultOverview);
  const [recentRuns, setRecentRuns] = useState<IndexedWorkflow[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const overviewResult = await getOverview();
      const workflowsResult = await getWorkflows();
      setOverview(overviewResult.data);
      setRecentRuns(workflowsResult.data.slice(0, 5));
      setDataSource(overviewResult.source === "fallback" || workflowsResult.source === "fallback" ? "fallback" : "live");
      setLoading(false);
    })();
  }, []);

  const failClosedRuns = recentRuns.filter((run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted");

  return (
    <section className="page">
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="Track system health, policy coverage, and the latest outcomes before diving into run details."
      />

      {dataSource === "fallback" ? (
        <article className="card card-tight">
          <span className="pill warn">Demo fallback data</span>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Live endpoints were unavailable, so this view is showing deterministic demo snapshots.
          </p>
        </article>
      ) : null}

      <div className="grid grid-3">
        <article className="card kpi">
          <h3>Active policies</h3>
          <p className="kpi-value">{overview.activePolicies}</p>
          <p className="muted">{overview.policyCount} total policy definitions.</p>
        </article>
        <article className="card kpi">
          <h3>Total runs</h3>
          <p className="kpi-value">{overview.workflowCount}</p>
          <p className="muted">Across deterministic and swarm workflows.</p>
        </article>
        <article className="card kpi">
          <h3>Fail-closed alerts</h3>
          <p className="kpi-value">{overview.failClosedAlerts}</p>
          <p className="muted">Requires triage in run center.</p>
          <p style={{ marginBottom: 0 }}>
            <Link href="/runs?status=denied">Review fail-closed runs</Link>
          </p>
        </article>
      </div>

      <article className="card">
        <div className="row-between">
          <div>
            <h3>Deterministic success rate</h3>
            <p className="muted">Last observed period from indexed workflow data.</p>
          </div>
          <span className="kpi-value">{Math.round(overview.deterministicSuccessRate * 100)}%</span>
        </div>
      </article>

      {loading ? (
        <article className="card">
          <p className="muted">Loading latest run activity...</p>
        </article>
      ) : recentRuns.length === 0 ? (
        <EmptyState
          title="No recent runs yet"
          description="Once workflows execute, this table will show the latest outcomes and evidence links."
          ctaHref="/onboarding"
          ctaLabel="Open readiness checks"
        />
      ) : (
        <article className="card">
          <div className="card-header row-between">
            <h3>Recent run outcomes</h3>
            <Link href="/runs">View all runs</Link>
          </div>
          <div className="table-wrap">
            <table aria-label="Recent runs">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Workflow</th>
                  <th>Policy</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.runId}>
                    <td className="mono"><Link href={`/runs/${run.runId}`}>{run.runId}</Link></td>
                    <td>{run.workflowId}</td>
                    <td className="mono">{run.policyId}</td>
                    <td><StatusPill state={run.state} /></td>
                    <td className="muted">{statusReason(run.state)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {failClosedRuns.length > 0 ? (
        <article className="card">
          <div className="card-header row-between">
            <h3>Needs review now</h3>
            <span className="pill warn">{failClosedRuns.length} fail-closed</span>
          </div>
          <div className="grid">
            {failClosedRuns.map((run) => (
              <div className="row-between card card-tight" key={run.runId}>
                <div>
                  <p className="mono" style={{ marginBottom: 4 }}>{run.runId}</p>
                  <p className="muted" style={{ marginBottom: 0 }}>{statusReason(run.state)}</p>
                </div>
                <Link href={`/runs/${run.runId}`}>Inspect</Link>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
