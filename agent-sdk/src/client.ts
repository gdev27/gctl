import { JsonRpcProvider, verifyMessage } from "ethers";
import { DailyNotionalStore, evaluatePolicy } from "../../policy-engine/src/engine";
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
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new PolicyClientError("TIMEOUT", `Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
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
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
  retryJitterRatio?: number;
  notionalCacheMaxEntries?: number;
  notionalCacheTtlMs?: number;
  allowUnverifiedReverse?: boolean;
};

export class PolicyClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly createProvider: (url: string) => JsonRpcProvider;
  private readonly retryBaseDelayMs: number;
  private readonly retryMaxDelayMs: number;
  private readonly retryJitterRatio: number;
  private readonly notionalCacheMaxEntries: number;
  private readonly notionalCacheTtlMs: number;
  private ensProvider: JsonRpcProvider | null = null;
  private l2Provider: JsonRpcProvider | null = null;
  private readonly notionalCache = new Map<string, { amount: number; expiresAt: number }>();

  constructor(private readonly opts: PolicyClientOptions) {
    this.timeoutMs = opts.timeoutMs ?? 5_000;
    this.maxRetries = opts.maxRetries ?? opts.retryCount ?? 1;
    this.createProvider = opts.createProvider ?? ((url: string) => new JsonRpcProvider(url));
    this.retryBaseDelayMs = Math.max(0, opts.retryBaseDelayMs ?? 200);
    this.retryMaxDelayMs = Math.max(this.retryBaseDelayMs, opts.retryMaxDelayMs ?? 2_000);
    this.retryJitterRatio = Math.min(1, Math.max(0, opts.retryJitterRatio ?? 0.2));
    this.notionalCacheMaxEntries = Math.max(1, opts.notionalCacheMaxEntries ?? 512);
    this.notionalCacheTtlMs = Math.max(1, opts.notionalCacheTtlMs ?? 48 * 60 * 60 * 1000);
  }

  private getCachedNotional(key: string): number | undefined {
    const cached = this.notionalCache.get(key);
    if (!cached) {
      return undefined;
    }
    if (cached.expiresAt <= Date.now()) {
      this.notionalCache.delete(key);
      return undefined;
    }
    // Keep LRU ordering by reinserting when accessed.
    this.notionalCache.delete(key);
    this.notionalCache.set(key, cached);
    return cached.amount;
  }

  private setCachedNotional(key: string, amount: number): void {
    const entry = { amount, expiresAt: Date.now() + this.notionalCacheTtlMs };
    if (this.notionalCache.has(key)) {
      this.notionalCache.delete(key);
    }
    this.notionalCache.set(key, entry);
    if (this.notionalCache.size > this.notionalCacheMaxEntries) {
      const oldestKey = this.notionalCache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.notionalCache.delete(oldestKey);
      }
    }
  }

  private computeRetryDelayMs(attempt: number): number {
    const baseDelay = Math.min(this.retryBaseDelayMs * 2 ** attempt, this.retryMaxDelayMs);
    if (this.retryJitterRatio === 0) {
      return baseDelay;
    }
    const jitterAmplitude = baseDelay * this.retryJitterRatio;
    const jitter = (Math.random() * 2 - 1) * jitterAmplitude;
    return Math.max(0, Math.round(baseDelay + jitter));
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let error: unknown;
    for (let i = 0; i <= this.maxRetries; i += 1) {
      try {
        return await withTimeout(fn(), this.timeoutMs);
      } catch (err) {
        error = err;
        if (i < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.computeRetryDelayMs(i)));
        }
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
      domain: "gctl.plan-action.v1",
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
        const agentResolver = await this.retry(() => resolver.getResolver(input.callerEnsName as string));
        if (!agentResolver) {
          return failClosed("AGENT_NOT_AUTHORIZED", input.callerEnsName);
        }
        const authorized = await this.retry(() =>
          resolver.verifyAgentAuthorization(input.callerEnsName as string, agentResolver)
        );
        if (!authorized) {
          return failClosed("AGENT_NOT_AUTHORIZED", input.callerEnsName);
        }
        identityPassport = await this.retry(() =>
          resolver.resolveIdentityPassport(input.callerEnsName as string, agentResolver)
        );
        if (!this.opts.allowUnverifiedReverse && !identityPassport.verifiedReverse) {
          return failClosed("ENS_REVERSE_VERIFICATION_FAILED", input.callerEnsName);
        }
      }

      const l2Provider = this.getL2Provider();
      const registryReader = new EvmPolicyRegistryReader(metadata.policyRegistryAddress, l2Provider);
      const meta = await this.retry(() => registryReader.getPolicyMeta(metadata.policyId));
      if (!meta.active) {
        return failClosed("POLICY_NOT_ACTIVE", metadata.policyId);
      }

      const graph = await this.retry(() => this.opts.storage.loadGraph(metadata.policyId, { verifyHash: meta.hash }));

      const notionalStore: DailyNotionalStore = {
        get: async (policyId, day) => {
          const key = `${policyId}:${day}`;
          const cached = this.getCachedNotional(key);
          if (typeof cached === "number") {
            return cached;
          }
          const persisted = await this.opts.storage.readDailyNotional?.(policyId, day);
          const value = persisted ?? 0;
          this.setCachedNotional(key, value);
          return value;
        },
        set: async (policyId, day, amount) => {
          const key = `${policyId}:${day}`;
          this.setCachedNotional(key, amount);
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
