"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/empty-state";
import { FallbackBanner } from "../components/fallback-banner";
import { PageHeader } from "../components/page-header";
import { getPolicies, getWorkflows } from "../lib/api";
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
    const controller = new AbortController();

    async function loadData() {
      try {
        const policiesResult = await getPolicies({ signal: controller.signal });
        const workflowsResult = await getWorkflows({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        const policies = policiesResult.data;
        const workflows = workflowsResult.data;
        const succeeded = workflows.filter((run) => run.state === "succeeded").length;
        const failClosedAlerts = workflows.filter(
          (run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted"
        ).length;
        setOverview({
          policyCount: policies.length,
          activePolicies: policies.filter((policy) => policy.active).length,
          workflowCount: workflows.length,
          failClosedAlerts,
          deterministicSuccessRate: workflows.length === 0 ? 0 : succeeded / workflows.length
        });
        setRecentRuns(workflows.slice(0, 5));
        setDataSource(
          policiesResult.source === "fallback" || workflowsResult.source === "fallback" ? "fallback" : "live"
        );
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => controller.abort();
  }, []);

  const failClosedRuns = useMemo(
    () =>
      recentRuns.filter(
        (run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted"
      ),
    [recentRuns]
  );

  return (
    <section className="page">
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="Track system health, policy coverage, and the latest outcomes before diving into run details."
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Live endpoints were unavailable, so this view is showing deterministic demo snapshots." />
      ) : null}

      <div className="grid grid-3">
        <article className="card feature-card kpi">
          <h3>Active policies</h3>
          <p className="kpi-value">{overview.activePolicies}</p>
          <p className="muted">{overview.policyCount} total policy definitions.</p>
        </article>
        <article className="card feature-card kpi">
          <h3>Total runs</h3>
          <p className="kpi-value">{overview.workflowCount}</p>
          <p className="muted">Across deterministic and swarm workflows.</p>
        </article>
        <article className="card alert-card kpi">
          <h3>Fail-closed alerts</h3>
          <p className="kpi-value">{overview.failClosedAlerts}</p>
          <p className="muted">Requires triage in run center.</p>
          <p className="mb-0">
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
        <article className="card" role="status" aria-live="polite">
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
        <article className="card alert-card">
          <div className="card-header row-between">
            <h3>Recent run outcomes</h3>
            <Link href="/runs">View all runs</Link>
          </div>
          <div className="table-wrap">
            <table aria-label="Recent runs">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th className="col-md">Workflow</th>
                  <th className="col-md">Policy</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.runId}>
                    <td className="mono cell-id">
                      <Link href={`/runs/${run.runId}`}>{run.runId}</Link>
                    </td>
                    <td className="col-md">{run.workflowId}</td>
                    <td className="mono cell-id col-md">{run.policyId}</td>
                    <td>
                      <StatusPill state={run.state} />
                    </td>
                    <td className="muted cell-reason">{statusReason(run.state)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {failClosedRuns.length > 0 ? (
        <article className="card alert-card">
          <div className="card-header row-between">
            <h3>Needs review now</h3>
            <span className="pill warn">{failClosedRuns.length} fail-closed</span>
          </div>
          <div className="grid">
            {failClosedRuns.map((run) => (
              <div className="row-between card card-tight" key={run.runId}>
                <div>
                  <p className="mono mb-1">{run.runId}</p>
                  <p className="muted mb-0">{statusReason(run.state)}</p>
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
