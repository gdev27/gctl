import { describe, expect, it } from "vitest";
import { MockKeeperHubClient } from "../keeperhub-workflows/src/client.mock";
import { reconcileWorkflow } from "../keeperhub-workflows/src/reconcile";

describe("workflow reconciliation", () => {
  it("waits for terminal state and writes audit log", async () => {
    const client = new MockKeeperHubClient();
    const workflow = await client.createWorkflow({
      name: "test",
      metadata: {},
      steps: []
    });
    const run = await client.runWorkflow(workflow.workflowId);
    const result = await reconcileWorkflow(client, {
      policyId: "policy-1",
      workflowId: workflow.workflowId,
      runId: run.runId,
      requestFingerprint: "fp",
      executionPlan: { allowed: true },
      maxPolls: 3,
      pollIntervalMs: 1
    });
    expect(result.state).toBe("succeeded");
    expect(result.auditPath).toContain(run.runId);
    expect(result.logCount).toBeGreaterThan(0);
    expect(result.analytics?.successRate).toBeTypeOf("number");
  });
});
