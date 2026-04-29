import { mockChecks, mockIdentityEvidence, mockOverview, mockPolicies, mockWorkflows } from "../../../../lib/mock-data";
import { IndexedPolicy, IndexedWorkflow, OnboardingCheck, OpsOverview, IdentityEvidence } from "../../../../lib/types";

const indexerBase = process.env.NEXT_PUBLIC_INDEXER_URL || process.env.INDEXER_URL || "http://localhost:4300";
const fundEnsName = process.env.NEXT_PUBLIC_FUND_ENS_NAME || process.env.FUND_ENS_NAME || "fund-not-configured.eth";

export type TrustStatus = "healthy" | "degraded" | "fallback";

export type SourceResult<T> = {
  data: T;
  source: "live" | "fallback";
  trustStatus: TrustStatus;
  reasonCode?: string;
  recoveryAction?: string;
};

function chooseSource(...sources: Array<"live" | "fallback">): "live" | "fallback" {
  return sources.includes("fallback") ? "fallback" : "live";
}

function toTrustStatus(source: "live" | "fallback"): TrustStatus {
  return source === "live" ? "healthy" : "fallback";
}

function mergeTrustMeta(
  ...results: Array<Pick<SourceResult<unknown>, "source" | "reasonCode" | "recoveryAction">>
): Pick<SourceResult<unknown>, "source" | "trustStatus" | "reasonCode" | "recoveryAction"> {
  const source = chooseSource(...results.map((result) => result.source));
  const firstFallback = results.find((result) => result.source === "fallback");
  return {
    source,
    trustStatus: toTrustStatus(source),
    reasonCode: firstFallback?.reasonCode,
    recoveryAction: firstFallback?.recoveryAction
  };
}

async function fetchIndexer<T>(path: string, fallback: T): Promise<SourceResult<T>> {
  try {
    const res = await fetch(`${indexerBase}${path}`, { cache: "no-store" });
    if (!res.ok) {
      return {
        data: fallback,
        source: "fallback",
        trustStatus: "fallback",
        reasonCode: `INDEXER_HTTP_${res.status}`,
        recoveryAction: "Verify INDEXER_URL/NEXT_PUBLIC_INDEXER_URL and confirm indexer API is healthy."
      };
    }
    return { data: (await res.json()) as T, source: "live", trustStatus: "healthy" };
  } catch {
    return {
      data: fallback,
      source: "fallback",
      trustStatus: "fallback",
      reasonCode: "INDEXER_UNREACHABLE",
      recoveryAction: "Start indexer with `npm run indexer:api` and re-check network connectivity."
    };
  }
}

export async function loadPolicies(): Promise<SourceResult<IndexedPolicy[]>> {
  return fetchIndexer<IndexedPolicy[]>(`/fund/${fundEnsName}/policies`, mockPolicies);
}

export async function loadWorkflows(): Promise<SourceResult<IndexedWorkflow[]>> {
  return fetchIndexer<IndexedWorkflow[]>("/workflows", mockWorkflows);
}

export async function loadOverview(): Promise<SourceResult<OpsOverview>> {
  const policiesResult = await loadPolicies();
  const workflowsResult = await loadWorkflows();
  const policies = policiesResult.data;
  const workflows = workflowsResult.data;
  const failClosedAlerts = workflows.filter((w) => w.state === "reverted" || w.state === "timed_out" || w.state === "denied").length;
  const succeeded = workflows.filter((w) => w.state === "succeeded").length;
  const deterministicSuccessRate = workflows.length === 0 ? 0 : succeeded / workflows.length;

  const trustMeta = mergeTrustMeta(policiesResult, workflowsResult);

  return {
    ...trustMeta,
    data: {
      policyCount: policies.length,
      activePolicies: policies.filter((p) => p.active).length,
      workflowCount: workflows.length,
      failClosedAlerts,
      deterministicSuccessRate
    }
  };
}

export async function loadChecks(): Promise<SourceResult<OnboardingCheck[]>> {
  const policiesResult = await loadPolicies();
  const workflowsResult = await loadWorkflows();
  const policies = policiesResult.data;
  const workflows = workflowsResult.data;
  const latestPolicyUpdate = policies.reduce((max, policy) => Math.max(max, policy.updatedAt), 0);
  const latestWorkflowUpdate = workflows.reduce((max, workflow) => Math.max(max, workflow.updatedAt), 0);
  const latestUpdate = Math.max(latestPolicyUpdate, latestWorkflowUpdate);
  const freshnessWindowMs = 1000 * 60 * 30;
  const isFresh = latestUpdate > 0 && Date.now() - latestUpdate <= freshnessWindowMs;

  const trustMeta = mergeTrustMeta(policiesResult, workflowsResult);
  const checks: OnboardingCheck[] = [
      {
        key: "indexer",
        label: "Indexer API",
        status: workflows.length > 0 ? "ok" : "warn",
        detail: workflows.length > 0 ? "Connected and returning workflow snapshots." : "No workflow snapshots returned."
      },
      {
        key: "policy",
        label: "Policy inventory",
        status: policies.length > 0 ? "ok" : "bad",
        detail: policies.length > 0 ? `${policies.length} policy records discovered.` : "No policy records found."
      },
      {
        key: "freshness",
        label: "Data freshness",
        status: isFresh ? "ok" : "warn",
        detail: isFresh ? "Indexed data updated within the last 30 minutes." : "Indexed data may be stale; refresh pipeline recommended."
      },
      ...mockChecks.filter((check) => check.key === "ens" || check.key === "attestation")
    ];

  return {
    ...trustMeta,
    trustStatus: !isFresh && trustMeta.trustStatus === "healthy" ? "degraded" : trustMeta.trustStatus,
    reasonCode: !isFresh && trustMeta.trustStatus === "healthy" ? "DATA_STALE" : trustMeta.reasonCode,
    recoveryAction:
      !isFresh && trustMeta.trustStatus === "healthy"
        ? "Refresh indexer ingestion and rerun deterministic demo to update snapshots."
        : trustMeta.recoveryAction,
    data: checks
  };
}

export async function loadEvidence(): Promise<SourceResult<IdentityEvidence[]>> {
  const workflowsResult = await loadWorkflows();
  const workflows = workflowsResult.data;
  if (workflows.length === 0) {
    return {
      data: mockIdentityEvidence,
      source: workflowsResult.source,
      trustStatus: workflowsResult.trustStatus,
      reasonCode: workflowsResult.reasonCode || "EVIDENCE_WORKFLOWS_EMPTY",
      recoveryAction: workflowsResult.recoveryAction || "Run deterministic/swarm demos to populate evidence snapshots."
    };
  }

  return {
    source: workflowsResult.source,
    trustStatus: workflowsResult.trustStatus,
    reasonCode: workflowsResult.reasonCode,
    recoveryAction: workflowsResult.recoveryAction,
    data: workflows.slice(0, 4).map((workflow, index) => ({
      ensName: `${workflow.pathType || "operator"}.${fundEnsName}`,
      role: workflow.pathType || "operator",
      capabilities: ["policy trace", "execution evidence"],
      attestation: `receipt:${workflow.runId}:${index + 1}`,
      auditPath: workflow.auditPath
    }))
  };
}

export async function loadFailClosed(): Promise<SourceResult<IndexedWorkflow[]>> {
  return fetchIndexer<IndexedWorkflow[]>("/alerts/fail-closed", mockWorkflows.filter((w) => w.state === "denied"));
}
