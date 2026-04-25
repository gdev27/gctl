import { KeeperHubWorkflow } from "./buildFromPlan";

export type WorkflowTerminalState = "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled" | "running";

export interface KeeperHubClient {
  createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }>;
  runWorkflow(workflowId: string): Promise<{ runId: string }>;
  getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }>;
}

export class HttpKeeperHubClient implements KeeperHubClient {
  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
        ...(init.headers || {})
      }
    });
    if (!response.ok) {
      throw new Error(`KeeperHub request failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  async createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }> {
    return this.request<{ workflowId: string }>("/workflows", {
      method: "POST",
      body: JSON.stringify(workflow)
    });
  }

  async runWorkflow(workflowId: string): Promise<{ runId: string }> {
    return this.request<{ runId: string }>(`/workflows/${workflowId}/runs`, {
      method: "POST"
    });
  }

  async getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }> {
    return this.request<{ state: WorkflowTerminalState; raw: unknown }>(`/runs/${runId}`, { method: "GET" });
  }
}
