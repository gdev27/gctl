import { describe, expect, it } from "vitest";
import { MainnetEnsResolver } from "../agent-sdk/src/ensResolver";

function buildProvider() {
  const textRecords: Record<string, string> = {
    "agent-role": "executor",
    "agent-capabilities": "execution,reconciliation,attestation",
    "agent-description": "Execution agent",
    "agent-endpoint": "mcp://policygraph/executor",
    "agent-version": "v2",
    "agent-policy-profile": "eurofund-mica",
    "agent-registration[erc8004][agentId]": "executor-1"
  };

  return {
    getResolver: async () => ({
      address: "0x0000000000000000000000000000000000000011",
      getText: async (key: string) => textRecords[key] || null
    }),
    resolveName: async () => "0x00000000000000000000000000000000000000aa",
    lookupAddress: async () => "executor.eurofund.eth"
  };
}

describe("ENS identity passport", () => {
  it("resolves agent passport with reverse-verification", async () => {
    const resolver = new MainnetEnsResolver(buildProvider() as any, "erc8004");
    const passport = await resolver.resolveIdentityPassport("executor.eurofund.eth");

    expect(passport.ensName).toBe("executor.eurofund.eth");
    expect(passport.verifiedReverse).toBe(true);
    expect(passport.role).toBe("executor");
    expect(passport.capabilities).toContain("execution");
  });

  it("uses ENS agent-registration record for authorization", async () => {
    const resolver = new MainnetEnsResolver(buildProvider() as any, "erc8004");
    expect(await resolver.verifyAgentAuthorization("executor.eurofund.eth")).toBe(true);
  });
});

