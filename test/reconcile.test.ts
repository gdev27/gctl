import { afterEach, describe, expect, it, vi } from "vitest";
import { MockKeeperHubClient } from "../keeperhub-workflows/src/client.mock";
import { reconcileWorkflow } from "../keeperhub-workflows/src/reconcile";

describe("workflow reconciliation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("applies polling backoff when configured", async () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const alwaysRunningClient = {
      getWorkflowStatus: async () => ({ state: "running" as const, raw: {} }),
      getExecutionLogs: async () => ({ events: [] }),
      getAnalytics: async () => ({ successRate: 0 })
    };

    const result = await reconcileWorkflow(alwaysRunningClient as any, {
      policyId: "policy-1",
      workflowId: "wf-1",
      runId: "run-1",
      requestFingerprint: "fp",
      executionPlan: { allowed: true },
      maxPolls: 4,
      pollIntervalMs: 10,
      pollBackoffMultiplier: 2,
      pollMaxIntervalMs: 40,
      pollJitterRatio: 0
    });

    const delayCalls = timeoutSpy.mock.calls
      .map((call) => call[1])
      .filter((value): value is number => typeof value === "number");
    expect(delayCalls).toContain(10);
    expect(delayCalls).toContain(20);
    expect(delayCalls).toContain(40);
    expect(result.state).toBe("timed_out");
  });
});
