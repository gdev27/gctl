import { ActionRequest, ExecutionPlan } from "../../policy-engine/src/types";

export type AgentRole = "planner" | "researcher" | "critic" | "executor";

export type MemoryEnvelope = {
  namespace: string;
  key: string;
  payload: Record<string, unknown>;
  encrypted: boolean;
  createdAt: string;
};

export type InferenceRequest = {
  role: AgentRole;
  objective: string;
  context: Record<string, unknown>;
  temperature?: number;
};

export type InferenceResponse = {
  output: string;
  provider: string;
  model: string;
  requestId: string;
  verified: boolean;
  raw?: unknown;
};

export type ChainAttestationInput = {
  policyId: string;
  action: ActionRequest;
  plan: ExecutionPlan;
  executionRef: string;
  artifactHash: string;
};

export type ChainAttestationReceipt = {
  chainId: number;
  txHash: string;
  attestationId: string;
};

export type AgentIdentityProfile = {
  ensName: string;
  resolverAddress?: string;
  walletAddress?: string;
  verifiedReverse: boolean;
  roles: AgentRole[];
  capabilities: string[];
  metadata: Record<string, string>;
};

export type ExecutionRequest = {
  workflowName: string;
  policyId: string;
  path: "safe-path" | "escalated-path";
  action: ActionRequest;
  plan: ExecutionPlan;
};

export type ExecutionReceipt = {
  workflowId: string;
  runId: string;
  state: "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled";
  auditPath: string;
  analytics?: {
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  };
};

export interface MemoryAdapter {
  write(envelope: MemoryEnvelope): Promise<{ uri: string; hash: string }>;
  read(namespace: string, key: string): Promise<MemoryEnvelope | null>;
}

export interface InferenceAdapter {
  infer(request: InferenceRequest): Promise<InferenceResponse>;
}

export interface ChainAdapter {
  anchorAttestation(input: ChainAttestationInput): Promise<ChainAttestationReceipt>;
}

export interface IdentityAdapter {
  getProfile(ensName: string): Promise<AgentIdentityProfile>;
  verifyAuthorization(ensName: string): Promise<boolean>;
}

export interface ExecutionAdapter {
  execute(request: ExecutionRequest): Promise<ExecutionReceipt>;
}

