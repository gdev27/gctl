import { afterEach, describe, expect, it, vi } from "vitest";
import { PolicyClient } from "../agent-sdk/src/client";
import { LocalFileAdapter } from "../policy-engine/src/storageAdapter";
import { MainnetEnsResolver } from "../agent-sdk/src/ensResolver";
import { EvmPolicyRegistryReader } from "../agent-sdk/src/registryReader";
import { compilePolicy, hashPolicyGraph } from "../policy-engine/src/compiler";
import { Policy } from "../policy-engine/src/types";

const policy: Policy = {
  id: "eurofund-mica",
  version: "1.0.0",
  schema_version: "1.0.0",
  jurisdiction: "EU",
  regulation: "MiCA",
  assets: {
    base: "EURRWA",
    settle_tokens: ["EURC", "USDC"]
  },
  privacy: {
    large_trade_threshold: 100000,
    large_trade_route: "private-mempool"
  },
  routing: {
    routing_threshold: 100000,
    small_trade_route: "cowswap",
    large_trade_route: "flashbots",
    allowed_dexes: ["FLASHBOTS_ROUTER"]
  },
  limits: {
    max_trade_value: 500000,
    max_daily_notional: 2000000,
    max_single_trade: 500000
  },
  reporting: {
    enabled: true,
    regulator_endpoint: "https://regulator.example/report",
    report_on: ["large_trades", "limits_breached"],
    fields: ["amount", "assetIn", "assetOut", "policyId"]
  },
  controls: {
    kill_switch_enabled: false
  }
};

describe("policy client fail closed", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns denied plan if ENS lookup fails", async () => {
    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      storage: new LocalFileAdapter("./policy-storage-test"),
      expectedRegistryChainId: 84532,
      timeoutMs: 50,
      maxRetries: 0
    });
    const result = await client.planAction({
      fundEnsName: "eurofund.eth",
      callerEnsName: "algo1.eurofund.eth",
      action: {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000
      }
    });
    expect(result.plan.allowed).toBe(false);
    expect(result.plan.reason).toBe("dependency_failure");
    expect(result.plan.errorCode).toContain("ENS_LOOKUP_FAILED");
  });

  it("rejects intent proof signed for unrelated message", async () => {
    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      storage: new LocalFileAdapter("./policy-storage-test"),
      expectedRegistryChainId: 84532,
      timeoutMs: 50,
      maxRetries: 0
    });

    const result = await client.planAction({
      fundEnsName: "eurofund.eth",
      action: {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000
      },
      intentProof: {
        message: "unrelated-message",
        signature: "0x1234",
        signerAddress: "0x0000000000000000000000000000000000000000"
      }
    });

    expect(result.plan.allowed).toBe(false);
    expect(result.plan.errorCode).toContain("INTENT_VERIFICATION_FAILED:intent_message_mismatch");
  });

  it("uses maxRetries as additional attempts", async () => {
    const resolveFundMetadata = vi
      .spyOn(MainnetEnsResolver.prototype, "resolveFundMetadata")
      .mockRejectedValue(new Error("ens_down"));

    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      storage: new LocalFileAdapter("./policy-storage-test"),
      expectedRegistryChainId: 84532,
      timeoutMs: 25,
      maxRetries: 2
    });

    await client.planAction({
      fundEnsName: "eurofund.eth",
      action: {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000
      }
    });

    expect(resolveFundMetadata).toHaveBeenCalledTimes(3);
  });

  it("reuses provider instances across repeated planAction calls", async () => {
    const graph = compilePolicy(policy);
    const policyHash = hashPolicyGraph(graph);
    const createProvider = vi.fn((url: string) => ({ url } as unknown as any));

    vi.spyOn(MainnetEnsResolver.prototype, "resolveFundMetadata").mockResolvedValue({
      policyId: "policy-cache",
      policyRegistryAddress: "0x0000000000000000000000000000000000000001",
      policyRegistryChainId: 84532,
      executionProfile: "standard"
    });
    vi.spyOn(MainnetEnsResolver.prototype, "verifyAgentAuthorization").mockResolvedValue(true);
    vi.spyOn(MainnetEnsResolver.prototype, "resolveIdentityPassport").mockResolvedValue({
      ensName: "algo1.eurofund.eth",
      walletAddress: "0x0000000000000000000000000000000000000001",
      resolverAddress: "0x0000000000000000000000000000000000000002",
      verifiedReverse: true,
      role: "executor",
      capabilities: ["execution"],
      metadata: {}
    });
    vi.spyOn(EvmPolicyRegistryReader.prototype, "getPolicyMeta").mockResolvedValue({
      hash: policyHash,
      uri: "file://policy",
      active: true
    });

    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      expectedRegistryChainId: 84532,
      maxRetries: 0,
      createProvider,
      storage: {
        saveGraph: async () => ({ uri: "file://x", hash: policyHash }),
        loadGraph: async () => graph
      }
    });

    const request = {
      fundEnsName: "eurofund.eth",
      callerEnsName: "algo1.eurofund.eth",
      action: {
        actionType: "swap" as const,
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000
      }
    };

    const first = await client.planAction(request);
    const second = await client.planAction(request);

    expect(first.plan.allowed).toBe(true);
    expect(second.plan.allowed).toBe(true);
    expect(createProvider).toHaveBeenCalledTimes(2);
  });
});
