import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAndValidatePolicy, validatePolicyObject } from "../dsl/src/validate";

describe("policy dsl validation", () => {
  it("validates sample policy", async () => {
    const policy = await loadAndValidatePolicy("dsl/samples/eurofund.mica.yaml");
    expect(policy.id).toBe("eurofund-mica");
    expect(policy.schema_version).toBe("1.0.0");
  });

  it("rejects unsupported schema version", async () => {
    const rawPath = path.resolve("dsl/samples/eurofund.mica.yaml");
    const raw = await fs.readFile(rawPath, "utf8");
    const altered = raw.replace("schema_version: 1.0.0", "schema_version: 2.0.0");
    const parsed = (await import("yaml")).parse(altered);
    expect(() => validatePolicyObject(parsed)).toThrow();
  });
});
