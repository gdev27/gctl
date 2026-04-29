"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { IndexedWorkflow } from "../../lib/types";
import { StatusPill } from "../../components/status-pill";
import { statusReason } from "../../lib/status";
import { RUN_FILTER_LABELS, RUN_PATH_LABELS } from "../../lib/ui-constants";

const filterLabels = RUN_FILTER_LABELS;
const pathLabels = RUN_PATH_LABELS;

function RunsClientInner({
  initialRuns,
  initialSource
}: {
  initialRuns: IndexedWorkflow[];
  initialSource: "live" | "fallback";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [runs] = useState<IndexedWorkflow[]>(initialRuns);
  const [dataSource] = useState<"live" | "fallback">(initialSource);
  const filter = useMemo<keyof typeof filterLabels>(() => {
    const status = searchParams.get("status");
    return status && status in filterLabels ? (status as keyof typeof filterLabels) : "all";
  }, [searchParams]);

  function onFilterChange(nextFilter: keyof typeof filterLabels) {
    const nextSearch = new URLSearchParams(searchParams.toString());
    if (nextFilter === "all") {
      nextSearch.delete("status");
    } else {
      nextSearch.set("status", nextFilter);
    }
    const query = nextSearch.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const visibleRuns = useMemo(() => {
    if (filter === "all") {
      return runs;
    }
    return runs.filter((run) => run.state === filter);
  }, [filter, runs]);

  const failClosedCount = useMemo(
    () =>
      runs.filter((run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted")
        .length,
    [runs]
  );

  return (
    <section className="page">
      <PageHeader
        eyebrow="Run Center"
        title="Execution timeline and triage"
        description="Find risky outcomes fast, understand why they happened, and drill into evidence for each run."
      />
      <div className="card card-tight row-between">
        <label htmlFor="statusFilter" className="field mb-0">
          <span className="field-label">Filter by status</span>
          <select
            id="statusFilter"
            className="select"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as keyof typeof filterLabels)}
          >
            {Object.entries(filterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span className="pill neutral">{visibleRuns.length} matching runs</span>
      </div>

      {dataSource === "fallback" ? (
        <FallbackBanner message="Run records are currently rendered from fallback snapshots instead of live execution feeds." />
      ) : null}

      <article className="card card-tight row-between">
        <div>
          <h3>Fail-closed outcomes</h3>
          <p className="muted">Denied, reverted, or timed-out runs requiring operator review.</p>
        </div>
        <span className={`pill ${failClosedCount > 0 ? "warn" : "ok"}`}>{failClosedCount}</span>
      </article>

      {visibleRuns.length === 0 ? (
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
                  <th className="col-md">Workflow</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th className="col-lg">Audit Path</th>
                </tr>
              </thead>
              <tbody>
                {visibleRuns.map((run) => (
                  <tr key={run.runId}>
                    <td className="mono cell-id">
                      <Link href={`/runs/${run.runId}`} aria-label={`Open details for run ${run.runId}`}>
                        {run.runId}
                      </Link>
                    </td>
                    <td className="col-md">{run.workflowId}</td>
                    <td>{run.pathType ? pathLabels[run.pathType] : "Not classified"}</td>
                    <td>
                      <StatusPill state={run.state} />
                    </td>
                    <td className="muted cell-reason">{statusReason(run.state)}</td>
                    <td className="mono cell-path col-lg">{run.auditPath}</td>
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

export function RunsClient(props: { initialRuns: IndexedWorkflow[]; initialSource: "live" | "fallback" }) {
  return (
    <Suspense
      fallback={
        <article className="card">
          <p className="muted">Loading run filters...</p>
        </article>
      }
    >
      <RunsClientInner {...props} />
    </Suspense>
  );
}
