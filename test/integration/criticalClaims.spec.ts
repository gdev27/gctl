import { afterEach, describe, expect, it, vi } from "vitest";
import { PolicyClient } from "../../agent-sdk/src/client";
import { MainnetEnsResolver } from "../../agent-sdk/src/ensResolver";
import { EvmPolicyRegistryReader } from "../../agent-sdk/src/registryReader";
import { compilePolicy, hashPolicyGraph } from "../../policy-engine/src/compiler";
import { Policy } from "../../policy-engine/src/types";
import { reconcileWorkflow } from "../../keeperhub-workflows/src/reconcile";
import { MockKeeperHubClient } from "../../keeperhub-workflows/src/client.mock";

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

describe("critical claims", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hashing is deterministic even with volatile compile timestamps", () => {
    const graphA = compilePolicy(policy);
    const graphB = { ...graphA, compiledAt: "2099-01-01T00:00:00.000Z" };
    expect(hashPolicyGraph(graphA)).toBe(hashPolicyGraph(graphB));
  });

  it("fails closed on invalid intent signature", async () => {
    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      expectedRegistryChainId: 84532,
      storage: {
        saveGraph: async () => ({ uri: "file://x", hash: "0x0" }),
        loadGraph: async () => compilePolicy(policy)
      }
    });

    const out = await client.planAction({
      fundEnsName: "eurofund.eth",
      callerEnsName: "algo1.eurofund.eth",
      action: {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 10000
      },
      intentProof: {
        message: "intent",
        signature: "0x1234",
        signerAddress: "0x0000000000000000000000000000000000000000"
      }
    });

    expect(out.plan.allowed).toBe(false);
    expect(out.plan.errorCode).toContain("INTENT_VERIFICATION_FAILED");
  });

  it("uses ENS execution profile to force private routing", async () => {
    const graph = compilePolicy(policy);
    const policyHash = hashPolicyGraph(graph);
    vi.spyOn(MainnetEnsResolver.prototype, "resolveFundMetadata").mockResolvedValue({
      policyId: "0xpolicy",
      policyRegistryAddress: "0x0000000000000000000000000000000000000001",
      policyRegistryChainId: 84532,
      executionProfile: "private-only"
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
      storage: {
        saveGraph: async () => ({ uri: "file://x", hash: policyHash }),
        loadGraph: async () => graph
      }
    });

    const out = await client.planAction({
      fundEnsName: "eurofund.eth",
      callerEnsName: "algo1.eurofund.eth",
      action: {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 10000
      }
    });

    expect(out.plan.allowed).toBe(true);
    expect(out.plan.route).toBe("private-mempool");
    expect(out.plan.pathType).toBe("direct-swap");
  });

  it("reconciliation persists terminal workflow state", async () => {
    const mock = new MockKeeperHubClient({ terminalState: "partial_fill" });
    const wf = await mock.createWorkflow({ name: "t", metadata: {}, steps: [] });
    const run = await mock.runWorkflow(wf.workflowId);
    const out = await reconcileWorkflow(mock, {
      policyId: "policy-1",
      workflowId: wf.workflowId,
      runId: run.runId,
      requestFingerprint: "fp",
      executionPlan: { allowed: true },
      maxPolls: 3,
      pollIntervalMs: 1
    });
    expect(out.state).toBe("partial_fill");
  });
});
