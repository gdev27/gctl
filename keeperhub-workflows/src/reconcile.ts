import fs from "node:fs/promises";
import path from "node:path";
import { KeeperHubClient, WorkflowTerminalState } from "./client";
import { redactAndEncryptAuditPayload } from "./auditPrivacy";

const TERMINAL_STATES: WorkflowTerminalState[] = ["succeeded", "reverted", "partial_fill", "timed_out", "cancelled"];

export type ReconcileInput = {
  policyId: string;
  workflowId: string;
  runId: string;
  requestFingerprint: string;
  executionPlan: unknown;
  maxPolls?: number;
  pollIntervalMs?: number;
};

export async function reconcileWorkflow(
  client: KeeperHubClient,
  input: ReconcileInput
): Promise<{
  state: WorkflowTerminalState;
  auditPath: string;
  logCount: number;
  analytics?: {
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  };
}> {
  const maxPolls = input.maxPolls ?? 20;
  const pollIntervalMs = input.pollIntervalMs ?? 1000;

  let finalState: WorkflowTerminalState = "running";
  let raw: unknown = null;
  for (let i = 0; i < maxPolls; i += 1) {
    const status = await client.getWorkflowStatus(input.runId);
    raw = status.raw;
    finalState = status.state;
    if (TERMINAL_STATES.includes(finalState)) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  if (!TERMINAL_STATES.includes(finalState)) {
    finalState = "timed_out";
  }

  const logDir = process.env.RECONCILIATION_LOG_DIR || "./reconciliation-logs";
  await fs.mkdir(logDir, { recursive: true });
  const encryptionKey = process.env.AUDIT_LOG_ENCRYPTION_KEY || "default-dev-key";
  const classification = {
    requestFingerprint: "public",
    policyId: "public",
    workflowId: "public",
    runId: "public",
    finalState: "public",
    executionPlan: "restricted",
    raw: "secret"
  } as const;

  const redacted = redactAndEncryptAuditPayload(
    {
      requestFingerprint: input.requestFingerprint,
      policyId: input.policyId,
      workflowId: input.workflowId,
      runId: input.runId,
      finalState,
      executionPlan: input.executionPlan,
      raw
    },
    classification,
    encryptionKey
  );

  const auditPath = path.resolve(logDir, `${input.runId}.json`);
  const executionLogs = client.getExecutionLogs ? await client.getExecutionLogs(input.runId) : { events: [] };
  const analytics = client.getAnalytics ? await client.getAnalytics() : undefined;
  await fs.writeFile(auditPath, JSON.stringify(redacted, null, 2), "utf8");
  return { state: finalState, auditPath, logCount: executionLogs.events.length, analytics };
}
