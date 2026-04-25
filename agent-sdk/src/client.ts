import { JsonRpcProvider, verifyMessage } from "ethers";
import { evaluatePolicy } from "../../policy-engine/src/engine";
import { hashPolicyGraph } from "../../policy-engine/src/compiler";
import { PolicyStorageAdapter } from "../../policy-engine/src/storageAdapter";
import { ExecutionPlan } from "../../policy-engine/src/types";
import { PolicyClientError } from "./errors";
import { MainnetEnsResolver } from "./ensResolver";
import { EvmPolicyRegistryReader } from "./registryReader";
import { PlanActionInput, PlanActionResult, PolicyClientSignerConfig } from "./types";

function failClosed(code: string, reason: string): PlanActionResult {
  const plan: ExecutionPlan = {
    allowed: false,
    reason: "dependency_failure",
    errorCode: `${code}:${reason}`
  };
  return { plan };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new PolicyClientError("TIMEOUT", `Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export type PolicyClientOptions = {
  ensMainnetRpcUrl: string;
  l2RegistryRpcUrl: string;
  storage: PolicyStorageAdapter;
  expectedRegistryChainId: number;
  timeoutMs?: number;
  retryCount?: number;
  agentRegistryAddress?: string;
  signer?: PolicyClientSignerConfig;
};

export class PolicyClient {
  private readonly timeoutMs: number;
  private readonly retryCount: number;

  constructor(private readonly opts: PolicyClientOptions) {
    this.timeoutMs = opts.timeoutMs ?? 5_000;
    this.retryCount = opts.retryCount ?? 1;
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let error: unknown;
    for (let i = 0; i <= this.retryCount; i += 1) {
      try {
        return await withTimeout(fn(), this.timeoutMs);
      } catch (err) {
        error = err;
      }
    }
    throw error;
  }

  private verifyIntentProof(input: PlanActionInput): PlanActionResult | null {
    if (!input.intentProof) {
      return null;
    }

    try {
      const recovered = verifyMessage(input.intentProof.message, input.intentProof.signature);
      if (recovered.toLowerCase() !== input.intentProof.signerAddress.toLowerCase()) {
        return failClosed("INTENT_VERIFICATION_FAILED", "signature_signer_mismatch");
      }
      return null;
    } catch (error) {
      return failClosed("INTENT_VERIFICATION_FAILED", String(error));
    }
  }

  async planAction(input: PlanActionInput): Promise<PlanActionResult> {
    try {
      const intentCheck = this.verifyIntentProof(input);
      if (intentCheck) {
        return intentCheck;
      }

      const ensProvider = new JsonRpcProvider(this.opts.ensMainnetRpcUrl);
      const resolver = new MainnetEnsResolver(ensProvider, this.opts.agentRegistryAddress);
      const metadata = await this.retry(() => resolver.resolveFundMetadata(input.fundEnsName));

      if (metadata.policyRegistryChainId !== this.opts.expectedRegistryChainId) {
        return failClosed("ENS_RECORD_MALFORMED", "registry_chain_mismatch");
      }

      if (input.callerEnsName) {
        const authorized = await this.retry(() => resolver.verifyAgentAuthorization(input.callerEnsName as string));
        if (!authorized) {
          return failClosed("AGENT_NOT_AUTHORIZED", input.callerEnsName);
        }
      }

      const l2Provider = new JsonRpcProvider(this.opts.l2RegistryRpcUrl);
      const registryReader = new EvmPolicyRegistryReader(metadata.policyRegistryAddress, l2Provider);
      const meta = await this.retry(() => registryReader.getPolicyMeta(metadata.policyId));
      if (!meta.active) {
        return failClosed("POLICY_NOT_ACTIVE", metadata.policyId);
      }

      const graph = await this.retry(() => this.opts.storage.loadGraph(metadata.policyId));
      const localHash = hashPolicyGraph(graph);
      if (localHash.toLowerCase() !== meta.hash.toLowerCase()) {
        return failClosed("POLICY_HASH_MISMATCH", metadata.policyId);
      }

      const plan = evaluatePolicy(graph, input.action);
      if (plan.allowed && metadata.executionProfile === "private-only") {
        plan.route = "private-mempool";
        plan.pathType = "direct-swap";
      }
      return {
        policyId: metadata.policyId,
        metadata,
        plan
      };
    } catch (error) {
      const e = error as PolicyClientError;
      return failClosed(e.code || "POLICY_EVALUATION_FAILED", e.message);
    }
  }
}
