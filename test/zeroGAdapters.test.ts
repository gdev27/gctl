import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZeroGChainAdapter, ZeroGComputeAdapter, ZeroGMemoryAdapter } from "../agent-sdk/src/zeroG";

const tempDirs: string[] = [];

async function makeDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "zerog-memory-"));
  tempDirs.push(dir);
  return dir;
}

describe("0G adapters", () => {
  afterEach(async () => {
    vi.restoreAllMocks();
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
    const files = await fs.readdir(dir);
    const stored = await fs.readFile(path.join(dir, files.find((file) => file.endsWith(".json") && !file.startsWith(".")) as string), "utf8");
    expect(stored).not.toContain("planner");

    const loaded = await memory.read("swarm", "state-1");
    expect(loaded?.payload.step).toBe("planner");
  });

  it("uses the remote download path when local cache is missing", async () => {
    const dir = await makeDir();
    let uploadedBody = "";
    const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "POST") {
        uploadedBody = String(init.body);
        return new Response(JSON.stringify({ uri: "og://storage/root-1", root: "root-1" }), { status: 200 });
      }
      if (url.startsWith("https://storage.example/download")) {
        return new Response(uploadedBody, { status: 200 });
      }
      return new Response("", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const memory = new ZeroGMemoryAdapter({
      storageDir: dir,
      storageEndpoint: "https://storage.example/upload",
      storageDownloadUrl: "https://storage.example/download"
    });
    const written = await memory.write({
      namespace: "swarm",
      key: "remote-state",
      payload: { step: "researcher" },
      encrypted: true,
      createdAt: "2026-01-01T00:00:00.000Z"
    });
    expect(written.uri).toBe("og://storage/root-1");

    const files = await fs.readdir(dir);
    await Promise.all(
      files
        .filter((file) => file.endsWith(".json") && !file.startsWith("."))
        .map((file) => fs.rm(path.join(dir, file), { force: true }))
    );

    const loaded = await memory.read("swarm", "remote-state");
    expect(loaded?.payload.step).toBe("researcher");
    expect(fetchMock).toHaveBeenCalledTimes(2);
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
    expect(receipt.kind).toBe("simulated");
    expect(receipt.receipt).toMatch(/^simulated-attestation:/);
    expect(receipt.txHash).toBeUndefined();
  });
});

