import { randomUUID } from "node:crypto";
import { KeeperHubWorkflow } from "./buildFromPlan";
import { KeeperHubClient, WorkflowTerminalState } from "./client";

type MockRun = {
  workflowId: string;
  state: WorkflowTerminalState;
  polls: number;
  startedAt: number;
};

export class MockKeeperHubClient implements KeeperHubClient {
  private readonly workflows = new Map<string, KeeperHubWorkflow>();
  private readonly runs = new Map<string, MockRun>();
  private readonly terminalState: WorkflowTerminalState;

  constructor(options?: { terminalState?: WorkflowTerminalState }) {
    this.terminalState = options?.terminalState ?? "succeeded";
  }

  async createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }> {
    const workflowId = `wf_${randomUUID()}`;
    this.workflows.set(workflowId, workflow);
    return { workflowId };
  }

  async runWorkflow(workflowId: string): Promise<{ runId: string }> {
    if (!this.workflows.has(workflowId)) {
      throw new Error(`Unknown workflow ${workflowId}`);
    }
    const runId = `run_${randomUUID()}`;
    this.runs.set(runId, { workflowId, state: "running", polls: 0, startedAt: Date.now() });
    return { runId };
  }

  async getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }> {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Unknown run ${runId}`);
    }

    run.polls += 1;
    if (run.polls >= 2) {
      run.state = this.terminalState;
    }
    return {
      state: run.state,
      raw: run
    };
  }

  async getExecutionLogs(runId: string): Promise<{ events: Array<Record<string, unknown>> }> {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Unknown run ${runId}`);
    }

    return {
      events: [
        { ts: new Date(run.startedAt).toISOString(), level: "info", message: "workflow_started" },
        { ts: new Date().toISOString(), level: "info", message: `workflow_${run.state}` }
      ]
    };
  }

  async getAnalytics(): Promise<{
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  }> {
    const runs = [...this.runs.values()];
    const succeeded = runs.filter((run) => run.state === "succeeded").length;
    const failed = runs.filter((run) => run.state !== "succeeded").length;
    const total = runs.length || 1;

    return {
      successRate: succeeded / total,
      failedRuns: failed,
      avgExecutionTimeMs: 1200,
      totalGasUsedWei: String(BigInt(total) * 1_000_000_000_000_000n)
    };
  }
}
