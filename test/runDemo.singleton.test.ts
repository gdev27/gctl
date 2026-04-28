import { beforeEach, describe, expect, it, vi } from "vitest";

let computeCtorCount = 0;
let memoryCtorCount = 0;
let chainCtorCount = 0;
let policyClientCtorCount = 0;
const buildStorageAdapterMock = vi.fn(() => ({ mocked: true }));
const planActionMock = vi.fn(async () => ({
  plan: {
    allowed: false,
    reason: "dependency_failure"
  }
}));

vi.mock("../agent-sdk/src/zeroG", () => ({
  ZeroGComputeAdapter: class ZeroGComputeAdapter {
    constructor() {
      computeCtorCount += 1;
    }
    async infer() {
      return {
        output: "ok",
        provider: "mock",
        model: "mock",
        requestId: "req_1",
        verified: true,
        raw: {}
      };
    }
  },
  ZeroGMemoryAdapter: class ZeroGMemoryAdapter {
    constructor() {
      memoryCtorCount += 1;
    }
    async write() {
      return { uri: "mock://memory", hash: "0xhash" };
    }
  },
  ZeroGChainAdapter: class ZeroGChainAdapter {
    constructor() {
      chainCtorCount += 1;
    }
    async anchorAttestation() {
      return { chainId: 1, txHash: "0xtx", attestationId: "attestation" };
    }
  }
}));

vi.mock("../agent-sdk/src/client", () => ({
  PolicyClient: class PolicyClient {
    constructor() {
      policyClientCtorCount += 1;
    }
    static buildIntentMessage() {
      return "intent";
    }
    async planAction() {
      return planActionMock();
    }
  }
}));

vi.mock("../policy-engine/src/storageAdapter", () => ({
  buildStorageAdapter: buildStorageAdapterMock
}));

describe("runDemo singleton lifecycle", () => {
  beforeEach(() => {
    vi.resetModules();
    computeCtorCount = 0;
    memoryCtorCount = 0;
    chainCtorCount = 0;
    policyClientCtorCount = 0;
    buildStorageAdapterMock.mockClear();
    planActionMock.mockClear();
  });

  it("reuses adapters and policy client across repeated invocations", async () => {
    const { runPolicyAndWorkflow } = await import("../keeperhub-workflows/src/runDemo");

    const request = {
      fundEnsName: "eurofund.eth",
      callerEnsName: "algo1.eurofund.eth",
      action: {
        actionType: "swap" as const,
        assetIn: "USDC",
        assetOut: "EURRWA",
        amount: 1000
      }
    };
    await runPolicyAndWorkflow(request);
    await runPolicyAndWorkflow(request);

    expect(computeCtorCount).toBe(1);
    expect(memoryCtorCount).toBe(1);
    expect(chainCtorCount).toBe(1);
    expect(policyClientCtorCount).toBe(1);
    expect(buildStorageAdapterMock).toHaveBeenCalledTimes(1);
    expect(planActionMock).toHaveBeenCalledTimes(2);
  });
});
