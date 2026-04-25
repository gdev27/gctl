import { ActionRequest, ExecutionPlan, PolicyGraph } from "../../policy-engine/src/types";

export type PlanActionInput = {
  fundEnsName: string;
  action: ActionRequest;
  callerEnsName?: string;
  intentProof?: {
    message: string;
    signature: string;
    signerAddress: string;
  };
};

export type EnsFundMetadata = {
  policyId: string;
  policyRegistryAddress: string;
  policyRegistryChainId: number;
  executionProfile: "standard" | "private-only";
};

export interface EnsResolver {
  resolveFundMetadata(fundEnsName: string): Promise<EnsFundMetadata>;
  verifyAgentAuthorization(agentEnsName: string): Promise<boolean>;
}

export interface PolicyRegistryReader {
  getPolicyMeta(policyId: string): Promise<{ hash: string; uri: string; active: boolean }>;
}

export interface PolicyGraphLoader {
  loadGraph(policyId: string): Promise<PolicyGraph>;
}

export interface PolicyClientSignerConfig {
  mode: "env-private-key" | "managed-signer";
  keyRef: string;
  version: string;
}

export type PlanActionResult = {
  policyId?: string;
  metadata?: EnsFundMetadata;
  plan: ExecutionPlan;
};
