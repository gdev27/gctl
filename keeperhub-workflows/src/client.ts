import { KeeperHubWorkflow } from "./buildFromPlan";

export type WorkflowTerminalState = "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled" | "running";

export interface KeeperHubClient {
  createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }>;
  runWorkflow(workflowId: string): Promise<{ runId: string }>;
  getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }>;
  getExecutionLogs?(runId: string): Promise<{ events: Array<Record<string, unknown>> }>;
  getAnalytics?(): Promise<{
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  }>;
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

  async getExecutionLogs(runId: string): Promise<{ events: Array<Record<string, unknown>> }> {
    return this.request<{ events: Array<Record<string, unknown>> }>(`/runs/${runId}/logs`, { method: "GET" });
  }

  async getAnalytics(): Promise<{
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  }> {
    return this.request<{
      successRate?: number;
      avgExecutionTimeMs?: number;
      failedRuns?: number;
      totalGasUsedWei?: string;
    }>(`/analytics/summary`, { method: "GET" });
  }
}
