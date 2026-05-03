import fs from "node:fs/promises";
import path from "node:path";
import { ZeroGMemoryAdapter } from "../../agent-sdk/src/zeroG";
import { hashPolicyGraph } from "./compiler";
import { PolicyGraph } from "./types";

export type LoadGraphOptions = {
  verifyHash?: string;
};

export interface PolicyStorageAdapter {
  saveGraph(policyId: string, graph: PolicyGraph): Promise<{ uri: string; hash: string }>;
  loadGraph(policyId: string, options?: LoadGraphOptions): Promise<PolicyGraph>;
  readDailyNotional?(policyId: string, day: string): Promise<number | undefined>;
  writeDailyNotional?(policyId: string, day: string, amount: number): Promise<void>;
}

export class LocalFileAdapter implements PolicyStorageAdapter {
  constructor(private readonly baseDir = process.env.POLICY_STORAGE_DIR || "./policy-storage") {}

  private sanitizePolicyId(policyId: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(policyId)) {
      throw new Error("invalid_policy_id");
    }
    return policyId;
  }

  private graphPath(policyId: string): string {
    const safePolicyId = this.sanitizePolicyId(policyId);
    return path.join(this.baseDir, `${safePolicyId}.json`);
  }

  private dailyNotionalPath(policyId: string, day: string): string {
    const safePolicyId = this.sanitizePolicyId(policyId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new Error("invalid_day_key");
    }
    return path.join(this.baseDir, "daily-notional", safePolicyId, `${day}.json`);
  }

  async saveGraph(policyId: string, graph: PolicyGraph): Promise<{ uri: string; hash: string }> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const filePath = this.graphPath(policyId);
    await fs.writeFile(filePath, JSON.stringify(graph, null, 2), "utf8");
    return {
      uri: `file://${path.resolve(filePath)}`,
      hash: hashPolicyGraph(graph)
    };
  }

  async loadGraph(policyId: string, options?: LoadGraphOptions): Promise<PolicyGraph> {
    const filePath = this.graphPath(policyId);
    const raw = await fs.readFile(filePath, "utf8");
    const graph = JSON.parse(raw) as PolicyGraph;
    if (options?.verifyHash) {
      const computedHash = hashPolicyGraph(graph);
      if (computedHash.toLowerCase() !== options.verifyHash.toLowerCase()) {
        throw new Error("policy_hash_mismatch");
      }
    }
    return graph;
  }

  async readDailyNotional(policyId: string, day: string): Promise<number | undefined> {
    try {
      const filePath = this.dailyNotionalPath(policyId, day);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as { amount?: unknown };
      if (typeof parsed.amount !== "number" || Number.isNaN(parsed.amount)) {
        return undefined;
      }
      return parsed.amount;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async writeDailyNotional(policyId: string, day: string, amount: number): Promise<void> {
    const filePath = this.dailyNotionalPath(policyId, day);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ amount }, null, 2), "utf8");
  }
}

export class OGAdapter implements PolicyStorageAdapter {
  private readonly memory: ZeroGMemoryAdapter;

  constructor(private readonly fallback = new LocalFileAdapter()) {
    this.memory = new ZeroGMemoryAdapter();
  }

  async saveGraph(policyId: string, graph: PolicyGraph): Promise<{ uri: string; hash: string }> {
    const graphHash = hashPolicyGraph(graph);
    const saved = await this.memory.write({
      namespace: "policy-graph",
      key: policyId,
      payload: {
        graph: graph as unknown as Record<string, unknown>,
        graphHash
      },
      encrypted: true,
      createdAt: new Date().toISOString()
    });
    return {
      uri: saved.uri,
      hash: graphHash
    };
  }

  async loadGraph(policyId: string, options?: LoadGraphOptions): Promise<PolicyGraph> {
    const envelope = await this.memory.read("policy-graph", policyId);
    if (!envelope) {
      return this.fallback.loadGraph(policyId, options);
    }
    const graph = envelope.payload.graph as unknown as PolicyGraph;
    if (options?.verifyHash) {
      const computedHash = hashPolicyGraph(graph);
      if (computedHash.toLowerCase() !== options.verifyHash.toLowerCase()) {
        throw new Error("policy_hash_mismatch");
      }
    }
    return graph;
  }

  async readDailyNotional(policyId: string, day: string): Promise<number | undefined> {
    return this.fallback.readDailyNotional?.(policyId, day);
  }

  async writeDailyNotional(policyId: string, day: string, amount: number): Promise<void> {
    await this.fallback.writeDailyNotional?.(policyId, day, amount);
  }
}

export function buildStorageAdapter(): PolicyStorageAdapter {
  const mode = (process.env.POLICY_STORAGE_ADAPTER || "local").toLowerCase();
  if (mode === "og") {
    return new OGAdapter();
  }
  return new LocalFileAdapter();
}
