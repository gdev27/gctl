import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ZeroGChainAdapter, ZeroGComputeAdapter, ZeroGMemoryAdapter } from "../agent-sdk/src/zeroG";

const tempDirs: string[] = [];

async function makeDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "zerog-memory-"));
  tempDirs.push(dir);
  return dir;
}

describe("0G adapters", () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  });

  it("writes and reads memory envelopes", async () => {
    const dir = await makeDir();
    const memory = new ZeroGMemoryAdapter({ storageDir: dir });
    const written = await memory.write({
      namespace: "swarm",
      key: "state-1",
      payload: { step: "planner" },
      encrypted: true,
      createdAt: "2026-01-01T00:00:00.000Z"
    });

    expect(written.uri).toContain("og://");
    expect(written.hash.length).toBeGreaterThan(10);

    const loaded = await memory.read("swarm", "state-1");
    expect(loaded?.payload.step).toBe("planner");
  });

  it("returns verified simulated inference when endpoint is absent", async () => {
    const compute = new ZeroGComputeAdapter({ computeEndpoint: undefined });
    const output = await compute.infer({
      role: "critic",
      objective: "review risk",
      context: { amount: 1000 }
    });
    expect(output.verified).toBe(true);
    expect(output.provider).toContain("0g-compute");
  });

  it("builds deterministic attestation receipts", async () => {
    const chain = new ZeroGChainAdapter({ chainId: 16602 });
    const receipt = await chain.anchorAttestation({
      policyId: "policy-1",
      action: { actionType: "swap", assetIn: "USDC", assetOut: "EURRWA", amount: 1000 },
      plan: { allowed: true, pathType: "batch-auction", route: "public" },
      executionRef: "run-1",
      artifactHash: "hash-abc"
    });

    expect(receipt.chainId).toBe(16602);
    expect(receipt.txHash.startsWith("0x")).toBe(true);
  });
});

