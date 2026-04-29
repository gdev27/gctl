import { IdentityEvidence, IndexedPolicy, IndexedWorkflow, OnboardingCheck, OpsOverview } from "./types";

export const mockPolicies: IndexedPolicy[] = [
  {
    policyId: "policy-core-01",
    hash: "0x4f4f8e8c8921ca6c",
    uri: "ipfs://bafybeigctl-policy-core",
    active: true,
    updatedAt: Date.now() - 1000 * 60 * 20
  },
  {
    policyId: "policy-risk-02",
    hash: "0x5a00c2206f72d19d",
    uri: "ipfs://bafybeigctl-policy-risk",
    active: true,
    updatedAt: Date.now() - 1000 * 60 * 55
  },
  {
    policyId: "policy-legacy-03",
    hash: "0x91b15cd6f83ca0a0",
    uri: "ipfs://bafybeigctl-policy-legacy",
    active: false,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6
  }
];

export const mockWorkflows: IndexedWorkflow[] = [
  {
    runId: "run-safe-1001",
    workflowId: "safe-path-small-trade",
    policyId: "policy-core-01",
    state: "succeeded",
    pathType: "safe",
    auditPath: "reconciliation-logs/run-safe-1001.json",
    updatedAt: Date.now() - 1000 * 60 * 5
  },
  {
    runId: "run-esc-1002",
    workflowId: "escalated-path-large-trade",
    policyId: "policy-risk-02",
    state: "partial_fill",
    pathType: "escalated",
    auditPath: "reconciliation-logs/run-escalated-1002.json",
    updatedAt: Date.now() - 1000 * 60 * 17
  },
  {
    runId: "run-blocked-1003",
    workflowId: "denial-trace",
    policyId: "policy-core-01",
    state: "denied",
    pathType: "blocked",
    auditPath: "reconciliation-logs/run-blocked-1003.json",
    updatedAt: Date.now() - 1000 * 60 * 31
  }
];

export const mockOverview: OpsOverview = {
  policyCount: mockPolicies.length,
  activePolicies: mockPolicies.filter((p) => p.active).length,
  workflowCount: mockWorkflows.length,
  failClosedAlerts: mockWorkflows.filter(
    (w) => w.state === "reverted" || w.state === "timed_out" || w.state === "denied"
  ).length,
  deterministicSuccessRate: 0.78
};

export const mockChecks: OnboardingCheck[] = [
  {
    key: "indexer",
    label: "Indexer API",
    status: "ok",
    detail: "Connected and returning workflow snapshots."
  },
  {
    key: "ens",
    label: "ENS Metadata",
    status: "warn",
    detail: "Some records are missing optional role descriptions."
  },
  {
    key: "keeperhub",
    label: "KeeperHub",
    status: "ok",
    detail: "Execution path is healthy and polling works."
  },
  { key: "attestation", label: "0G Attestation", status: "warn", detail: "Running in demo receipt mode." }
];

export const mockIdentityEvidence: IdentityEvidence[] = [
  {
    ensName: "planner.gctl.eth",
    role: "planner",
    capabilities: ["intent drafting", "policy alignment"],
    attestation: "demo-receipt:0xattest001",
    auditPath: "reconciliation-logs/run-safe-1001.json"
  },
  {
    ensName: "critic.gctl.eth",
    role: "critic",
    capabilities: ["risk challenge", "route veto"],
    attestation: "demo-receipt:0xattest002",
    auditPath: "reconciliation-logs/run-escalated-1002.json"
  }
];
