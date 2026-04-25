import { describe, expect, it } from "vitest";
import { redactAndEncryptAuditPayload } from "../keeperhub-workflows/src/auditPrivacy";

describe("audit privacy controls", () => {
  it("hashes restricted fields and encrypts secret fields", () => {
    const payload = {
      policyId: "abc",
      executionPlan: { amount: 100000 },
      raw: { txData: "0xdeadbeef" }
    };

    const out = redactAndEncryptAuditPayload(
      payload,
      {
        policyId: "public",
        executionPlan: "restricted",
        raw: "secret"
      },
      "test-key"
    );

    expect(out.policyId).toBe("abc");
    expect(out.executionPlan).not.toEqual(payload.executionPlan);
    expect(typeof out.raw).toBe("string");
    expect((out.raw as string).includes("deadbeef")).toBe(false);
  });
});
