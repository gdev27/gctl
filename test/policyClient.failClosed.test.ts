import { describe, expect, it } from "vitest";
import { PolicyClient } from "../agent-sdk/src/client";
import { LocalFileAdapter } from "../policy-engine/src/storageAdapter";

describe("policy client fail closed", () => {
  it("returns denied plan if ENS lookup fails", async () => {
    const client = new PolicyClient({
      ensMainnetRpcUrl: "http://127.0.0.1:1",
      l2RegistryRpcUrl: "http://127.0.0.1:1",
      storage: new LocalFileAdapter("./policy-storage-test"),
      expectedRegistryChainId: 84532,
      timeoutMs: 50,
      retryCount: 0
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
});
