export type IndexedPolicy = {
  policyId: string;
  hash: string;
  uri: string;
  active: boolean;
  updatedAt: number;
};

export type IndexedWorkflow = {
  runId: string;
  workflowId: string;
  policyId: string;
  state: "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled" | "running" | "denied";
  auditPath: string;
  updatedAt: number;
  pathType?: "safe" | "escalated" | "blocked";
};

export type OpsOverview = {
  policyCount: number;
  activePolicies: number;
  workflowCount: number;
  failClosedAlerts: number;
  deterministicSuccessRate: number;
};

export type OnboardingCheck = {
  key: string;
  label: string;
  status: "ok" | "warn" | "bad";
  detail: string;
};

export type IdentityEvidence = {
  ensName: string;
  role: string;
  capabilities: string[];
  attestation: string;
  auditPath: string;
};
