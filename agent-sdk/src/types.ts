import { ActionRequest, ExecutionPlan, PolicyGraph } from "../../policy-engine/src/types";
import { LoadGraphOptions } from "../../policy-engine/src/storageAdapter";

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

export type EnsIdentityPassport = {
  ensName: string;
  walletAddress: string | null;
  resolverAddress: string;
  verifiedReverse: boolean;
  role: string;
  capabilities: string[];
  metadata: Record<string, string>;
};

export interface EnsResolver {
  resolveFundMetadata(fundEnsName: string): Promise<EnsFundMetadata>;
  verifyAgentAuthorization(agentEnsName: string): Promise<boolean>;
  resolveIdentityPassport(agentEnsName: string): Promise<EnsIdentityPassport>;
}

export interface PolicyRegistryReader {
  getPolicyMeta(policyId: string): Promise<{ hash: string; uri: string; active: boolean }>;
}

export interface PolicyGraphLoader {
  loadGraph(policyId: string, options?: LoadGraphOptions): Promise<PolicyGraph>;
}

export interface PolicyClientSignerConfig {
  mode: "env-private-key" | "managed-signer";
  keyRef: string;
  version: string;
}

export type PlanActionResult = {
  policyId?: string;
  metadata?: EnsFundMetadata;
  identityPassport?: EnsIdentityPassport;
  plan: ExecutionPlan;
};
