import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkflowById } from "../../api/ops/_lib/data";
import { CopyTextButton } from "../../../components/copy-text-button";
import { FallbackBanner } from "../../../components/fallback-banner";
import { PageHeader } from "../../../components/page-header";
import { StatusPill } from "../../../components/status-pill";
import { statusReason } from "../../../lib/status";

export default async function RunDetailsPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!/^[a-zA-Z0-9:_-]{3,128}$/.test(runId)) {
    notFound();
  }
  const workflowsResult = await loadWorkflowById(runId);
  const run = workflowsResult.data;

  if (!run) {
    notFound();
  }

  const pathType = run.pathType
    ? `${run.pathType.charAt(0).toUpperCase()}${run.pathType.slice(1)} Path`
    : "Unclassified";
  const isFailClosed = run.state === "denied" || run.state === "timed_out" || run.state === "reverted";

  return (
    <section className="page">
      <PageHeader
        eyebrow="Run Detail"
        title={`Run ${run.runId}`}
        description="Review execution outcome, policy linkage, and evidence pointers before taking action."
      />
      <p className="muted mb-0">Runs / {run.runId}</p>
      <p className="mb-0">
        <Link href="/runs">Back to run center</Link>
      </p>

      {workflowsResult.source === "fallback" ? (
        <FallbackBanner message="This run detail is rendered from fallback snapshots because live run data was unavailable." />
      ) : null}

      <article className="card">
        <div className="grid grid-2">
          <div>
            <p className="field-label">Workflow</p>
            <div className="row-between">
              <p className="mono">{run.workflowId}</p>
              <CopyTextButton value={run.workflowId} />
            </div>
          </div>
          <div>
            <p className="field-label">Policy</p>
            <div className="row-between">
              <p className="mono">{run.policyId}</p>
              <CopyTextButton value={run.policyId} />
            </div>
          </div>
          <div>
            <p className="field-label">Status</p>
            <StatusPill state={run.state} />
          </div>
          <div>
            <p className="field-label">Execution path</p>
            <p>{pathType}</p>
          </div>
        </div>
        <div className="card card-tight mt-4 support-card">
          <p className="field-label">Status context</p>
          <p className="mb-0">{statusReason(run.state)}</p>
        </div>
      </article>

      <article className="card">
        <h3>Evidence trail</h3>
        <p className="field-label">Audit artifact path</p>
        <div className="row-between">
          <p className="mono">{run.auditPath}</p>
          <CopyTextButton value={run.auditPath} />
        </div>
        <p className="muted mb-0">
          For denied or timed-out outcomes, confirm readiness checks and policy limits before retrying.
        </p>
      </article>

      {isFailClosed ? (
        <article className="card">
          <h3>Fail-closed recovery steps</h3>
          <ol className="muted run-recovery-list">
            <li>Confirm readiness checks are healthy in the Readiness view.</li>
            <li>Validate policy limits and intent fields before re-running.</li>
            <li>Re-run only after evidence and policy references match expected values.</li>
          </ol>
        </article>
      ) : null}
    </section>
  );
}
