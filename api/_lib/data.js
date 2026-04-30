import {
  mockChecks,
  mockIdentityEvidence,
  mockPolicies,
  mockWorkflows,
} from "./mock-data.js";

const indexerBase = process.env.INDEXER_URL || "http://localhost:4300";
const fundEnsName = process.env.FUND_ENS_NAME || "fund-not-configured.eth";

function chooseSource(...sources) {
  return sources.includes("fallback") ? "fallback" : "live";
}

function toTrustStatus(source) {
  return source === "live" ? "healthy" : "fallback";
}

function mergeTrustMeta(...results) {
  const source = chooseSource(...results.map((result) => result.source));
  const firstFallback = results.find((result) => result.source === "fallback");
  return {
    source,
    trustStatus: toTrustStatus(source),
    reasonCode: firstFallback?.reasonCode,
    recoveryAction: firstFallback?.recoveryAction,
  };
}

async function fetchIndexer(path, fallback) {
  try {
    const res = await fetch(`${indexerBase}${path}`, { cache: "no-store" });
    if (!res.ok) {
      return {
        data: fallback,
        source: "fallback",
        trustStatus: "fallback",
        reasonCode: `INDEXER_HTTP_${res.status}`,
        recoveryAction: "Verify INDEXER_URL and confirm indexer API is healthy.",
      };
    }
    return { data: await res.json(), source: "live", trustStatus: "healthy" };
  } catch {
    return {
      data: fallback,
      source: "fallback",
      trustStatus: "fallback",
      reasonCode: "INDEXER_UNREACHABLE",
      recoveryAction: "Start indexer with `npm run indexer:api` and re-check network connectivity.",
    };
  }
}

export async function loadPolicies() {
  return fetchIndexer(`/fund/${fundEnsName}/policies`, mockPolicies);
}

export async function loadWorkflows() {
  return fetchIndexer("/workflows", mockWorkflows);
}

export async function loadOverview() {
  const policiesResult = await loadPolicies();
  const workflowsResult = await loadWorkflows();
  const policies = policiesResult.data;
  const workflows = workflowsResult.data;
  const failClosedAlerts = workflows.filter(
    (w) => w.state === "reverted" || w.state === "timed_out" || w.state === "denied",
  ).length;
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
      deterministicSuccessRate,
    },
  };
}

export async function loadChecks() {
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
  const checks = [
    {
      key: "indexer",
      label: "Indexer API",
      status: workflows.length > 0 ? "ok" : "warn",
      detail:
        workflows.length > 0
          ? "Connected and returning workflow snapshots."
          : "No workflow snapshots returned.",
    },
    {
      key: "policy",
      label: "Policy inventory",
      status: policies.length > 0 ? "ok" : "bad",
      detail:
        policies.length > 0 ? `${policies.length} policy records discovered.` : "No policy records found.",
    },
    {
      key: "freshness",
      label: "Data freshness",
      status: isFresh ? "ok" : "warn",
      detail: isFresh
        ? "Indexed data updated within the last 30 minutes."
        : "Indexed data may be stale; refresh pipeline recommended.",
    },
    ...mockChecks.filter((check) => check.key === "ens" || check.key === "attestation"),
  ];
  return {
    ...trustMeta,
    trustStatus: !isFresh && trustMeta.trustStatus === "healthy" ? "degraded" : trustMeta.trustStatus,
    reasonCode: !isFresh && trustMeta.trustStatus === "healthy" ? "DATA_STALE" : trustMeta.reasonCode,
    recoveryAction:
      !isFresh && trustMeta.trustStatus === "healthy"
        ? "Refresh indexer ingestion and rerun deterministic demo to update snapshots."
        : trustMeta.recoveryAction,
    data: checks,
  };
}

export async function loadEvidence() {
  const workflowsResult = await loadWorkflows();
  const workflows = workflowsResult.data;
  if (workflows.length === 0) {
    return {
      data: mockIdentityEvidence,
      source: workflowsResult.source,
      trustStatus: workflowsResult.trustStatus,
      reasonCode: workflowsResult.reasonCode || "EVIDENCE_WORKFLOWS_EMPTY",
      recoveryAction:
        workflowsResult.recoveryAction || "Run deterministic/swarm demos to populate evidence snapshots.",
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
      auditPath: workflow.auditPath,
    })),
  };
}

export async function loadFailClosed() {
  return fetchIndexer(
    "/alerts/fail-closed",
    mockWorkflows.filter((w) => w.state === "denied"),
  );
}

export async function loadConnectors() {
  const policiesResult = await loadPolicies();
  const workflowsResult = await loadWorkflows();
  const latestWorkflowSync =
    workflowsResult.data.reduce((max, run) => Math.max(max, run.updatedAt), 0) || null;
  const baseConnectors = [
    {
      key: "wallet",
      label: "Wallet + chain status",
      health: process.env.WALLET_RPC_URL ? "connected" : "degraded",
      detail: process.env.WALLET_RPC_URL
        ? "Wallet RPC endpoint is configured."
        : "Wallet RPC endpoint is not configured for operator checks.",
      recoveryAction: "Set WALLET_RPC_URL and verify chain reachability from this deployment.",
      lastSync: null,
    },
    {
      key: "policyRegistry",
      label: "Policy registry lifecycle",
      health: process.env.POLICY_REGISTRY_ADDRESS ? "connected" : "degraded",
      detail: process.env.POLICY_REGISTRY_ADDRESS
        ? `Registry configured at ${process.env.POLICY_REGISTRY_ADDRESS}.`
        : "Policy registry address is missing.",
      recoveryAction: "Set POLICY_REGISTRY_ADDRESS to enable publish + lookup lifecycle visibility.",
      lastSync: null,
    },
    {
      key: "ensIdentity",
      label: "ENS identity and delegation",
      health: process.env.FUND_ENS_NAME ? "connected" : "degraded",
      detail: process.env.FUND_ENS_NAME
        ? `Fund identity is configured as ${process.env.FUND_ENS_NAME}.`
        : "Fund ENS name is not configured.",
      recoveryAction: "Set FUND_ENS_NAME and update ENS identity records.",
      lastSync: null,
    },
    {
      key: "keeperhub",
      label: "KeeperHub reconciliation",
      health: process.env.KEEPERHUB_API_KEY ? "connected" : "degraded",
      detail: process.env.KEEPERHUB_API_KEY
        ? "KeeperHub API key is configured for workflow orchestration."
        : "KeeperHub API key is not configured.",
      recoveryAction: "Set KEEPERHUB_API_KEY to connect reconciliation and retry visibility.",
      lastSync: latestWorkflowSync,
    },
    {
      key: "indexer",
      label: "Indexer trust and freshness",
      health:
        workflowsResult.source === "live" && policiesResult.source === "live" ? "connected" : "disconnected",
      detail:
        workflowsResult.source === "live" && policiesResult.source === "live"
          ? "Indexer is returning live policies and workflow telemetry."
          : "Indexer is unreachable; fallback snapshots are active.",
      recoveryAction: "Start indexer (`npm run indexer:api`) and verify INDEXER_URL.",
      lastSync: latestWorkflowSync,
    },
  ];
  const trustMeta = mergeTrustMeta(policiesResult, workflowsResult);
  return {
    ...trustMeta,
    reasonCode: trustMeta.reasonCode,
    recoveryAction: trustMeta.recoveryAction,
    data: baseConnectors.map((connector) =>
      trustMeta.source === "fallback" && connector.key !== "indexer" && connector.health === "connected"
        ? {
            ...connector,
            health: "degraded",
            detail: `${connector.detail} Live telemetry is currently unavailable.`,
          }
        : connector,
    ),
  };
}
