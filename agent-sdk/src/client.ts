import { JsonRpcProvider, verifyMessage } from "ethers";
import { DailyNotionalStore, evaluatePolicy } from "../../policy-engine/src/engine";
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
  maxRetries?: number;
  retryCount?: number;
  agentRegistryAddress?: string;
  signer?: PolicyClientSignerConfig;
  createProvider?: (url: string) => JsonRpcProvider;
};

export class PolicyClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly createProvider: (url: string) => JsonRpcProvider;
  private ensProvider: JsonRpcProvider | null = null;
  private l2Provider: JsonRpcProvider | null = null;
  private readonly notionalCache = new Map<string, number>();

  constructor(private readonly opts: PolicyClientOptions) {
    this.timeoutMs = opts.timeoutMs ?? 5_000;
    this.maxRetries = opts.maxRetries ?? opts.retryCount ?? 1;
    this.createProvider = opts.createProvider ?? ((url: string) => new JsonRpcProvider(url));
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let error: unknown;
    for (let i = 0; i <= this.maxRetries; i += 1) {
      try {
        return await withTimeout(fn(), this.timeoutMs);
      } catch (err) {
        error = err;
      }
    }
    throw error;
  }

  private getEnsProvider(): JsonRpcProvider {
    if (!this.ensProvider) {
      this.ensProvider = this.createProvider(this.opts.ensMainnetRpcUrl);
    }
    return this.ensProvider;
  }

  private getL2Provider(): JsonRpcProvider {
    if (!this.l2Provider) {
      this.l2Provider = this.createProvider(this.opts.l2RegistryRpcUrl);
    }
    return this.l2Provider;
  }

  static buildIntentMessage(input: Pick<PlanActionInput, "fundEnsName" | "action">): string {
    return JSON.stringify({
      domain: "institutional-policy-os.plan-action.v1",
      fundEnsName: input.fundEnsName,
      action: {
        actionType: input.action.actionType,
        assetIn: input.action.assetIn,
        assetOut: input.action.assetOut,
        amount: input.action.amount,
        timestamp: input.action.timestamp ?? null,
        clientId: input.action.clientId ?? null
      }
    });
  }

  private verifyIntentProof(input: PlanActionInput): PlanActionResult | null {
    if (!input.intentProof) {
      return null;
    }

    try {
      const expectedMessage = PolicyClient.buildIntentMessage(input);
      if (input.intentProof.message !== expectedMessage) {
        return failClosed("INTENT_VERIFICATION_FAILED", "intent_message_mismatch");
      }
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

      const ensProvider = this.getEnsProvider();
      const resolver = new MainnetEnsResolver(ensProvider, this.opts.agentRegistryAddress);
      const metadata = await this.retry(() => resolver.resolveFundMetadata(input.fundEnsName));
      let identityPassport;

      if (metadata.policyRegistryChainId !== this.opts.expectedRegistryChainId) {
        return failClosed("ENS_RECORD_MALFORMED", "registry_chain_mismatch");
      }

      if (input.callerEnsName) {
        const authorized = await this.retry(() => resolver.verifyAgentAuthorization(input.callerEnsName as string));
        if (!authorized) {
          return failClosed("AGENT_NOT_AUTHORIZED", input.callerEnsName);
        }
        identityPassport = await this.retry(() => resolver.resolveIdentityPassport(input.callerEnsName as string));
      }

      const l2Provider = this.getL2Provider();
      const registryReader = new EvmPolicyRegistryReader(metadata.policyRegistryAddress, l2Provider);
      const meta = await this.retry(() => registryReader.getPolicyMeta(metadata.policyId));
      if (!meta.active) {
        return failClosed("POLICY_NOT_ACTIVE", metadata.policyId);
      }

      const graph = await this.retry(() => this.opts.storage.loadGraph(metadata.policyId, { verifyHash: meta.hash }));
      const localHash = hashPolicyGraph(graph); // Keep local check for defensive compatibility across adapter implementations.
      if (localHash.toLowerCase() !== meta.hash.toLowerCase()) {
        return failClosed("POLICY_HASH_MISMATCH", metadata.policyId);
      }

      const notionalStore: DailyNotionalStore = {
        get: async (policyId, day) => {
          const key = `${policyId}:${day}`;
          if (this.notionalCache.has(key)) {
            return this.notionalCache.get(key) as number;
          }
          const persisted = await this.opts.storage.readDailyNotional?.(policyId, day);
          const value = persisted ?? 0;
          this.notionalCache.set(key, value);
          return value;
        },
        set: async (policyId, day, amount) => {
          const key = `${policyId}:${day}`;
          this.notionalCache.set(key, amount);
          await this.opts.storage.writeDailyNotional?.(policyId, day, amount);
        }
      };

      const plan = await evaluatePolicy(graph, input.action, notionalStore);
      if (plan.allowed && metadata.executionProfile === "private-only") {
        plan.route = "private-mempool";
        plan.pathType = "direct-swap";
      }
      return {
        policyId: metadata.policyId,
        metadata,
        identityPassport,
        plan
      };
    } catch (error) {
      const e = error as PolicyClientError;
      return failClosed(e.code || "POLICY_EVALUATION_FAILED", e.message);
    }
  }
}
