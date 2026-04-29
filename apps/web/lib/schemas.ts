import { z } from "zod";

export const indexedPolicySchema = z.object({
  policyId: z.string(),
  hash: z.string(),
  uri: z.string(),
  active: z.boolean(),
  updatedAt: z.number()
});

export const indexedWorkflowSchema = z.object({
  runId: z.string(),
  workflowId: z.string(),
  policyId: z.string(),
  state: z.enum(["succeeded", "reverted", "partial_fill", "timed_out", "cancelled", "running", "denied"]),
  auditPath: z.string(),
  updatedAt: z.number(),
  pathType: z.enum(["safe", "escalated", "blocked"]).optional()
});

export const opsOverviewSchema = z.object({
  policyCount: z.number(),
  activePolicies: z.number(),
  workflowCount: z.number(),
  failClosedAlerts: z.number(),
  deterministicSuccessRate: z.number()
});

export const onboardingCheckSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(["ok", "warn", "bad"]),
  detail: z.string()
});

export const identityEvidenceSchema = z.object({
  ensName: z.string(),
  role: z.string(),
  capabilities: z.array(z.string()),
  attestation: z.string(),
  auditPath: z.string()
});
