import fs from "node:fs/promises";
import path from "node:path";
import { hashPolicyGraph } from "./compiler";
import { PolicyGraph } from "./types";

export interface PolicyStorageAdapter {
  saveGraph(policyId: string, graph: PolicyGraph): Promise<{ uri: string; hash: string }>;
  loadGraph(policyId: string): Promise<PolicyGraph>;
}

export class LocalFileAdapter implements PolicyStorageAdapter {
  constructor(private readonly baseDir = process.env.POLICY_STORAGE_DIR || "./policy-storage") {}

  private graphPath(policyId: string): string {
    return path.join(this.baseDir, `${policyId}.json`);
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

  async loadGraph(policyId: string): Promise<PolicyGraph> {
    const filePath = this.graphPath(policyId);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as PolicyGraph;
  }
}

export class OGAdapter implements PolicyStorageAdapter {
  constructor(private readonly fallback = new LocalFileAdapter()) {}

  // Stub for MVP. Interface remains stable for swapping to real 0G APIs.
  async saveGraph(policyId: string, graph: PolicyGraph): Promise<{ uri: string; hash: string }> {
    const saved = await this.fallback.saveGraph(policyId, graph);
    return {
      ...saved,
      uri: saved.uri.replace("file://", "og://stub/")
    };
  }

  async loadGraph(policyId: string): Promise<PolicyGraph> {
    return this.fallback.loadGraph(policyId);
  }
}

export function buildStorageAdapter(): PolicyStorageAdapter {
  const mode = (process.env.POLICY_STORAGE_ADAPTER || "local").toLowerCase();
  if (mode === "og") {
    return new OGAdapter();
  }
  return new LocalFileAdapter();
}
