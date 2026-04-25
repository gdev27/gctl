import { randomUUID } from "node:crypto";
import { KeeperHubWorkflow } from "./buildFromPlan";
import { KeeperHubClient, WorkflowTerminalState } from "./client";

type MockRun = {
  workflowId: string;
  state: WorkflowTerminalState;
  polls: number;
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
    this.runs.set(runId, { workflowId, state: "running", polls: 0 });
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
}
