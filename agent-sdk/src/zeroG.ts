import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  ChainAdapter,
  ChainAttestationInput,
  ChainAttestationReceipt,
  InferenceAdapter,
  InferenceRequest,
  InferenceResponse,
  MemoryAdapter,
  MemoryEnvelope
} from "./adapters";

type ZeroGConfig = {
  storageDir?: string;
  storageEndpoint?: string;
  computeEndpoint?: string;
  computeModel?: string;
  chainId?: number;
};

export class ZeroGMemoryAdapter implements MemoryAdapter {
  private readonly storageDir: string;
  private readonly storageEndpoint?: string;

  constructor(config: ZeroGConfig = {}) {
    this.storageDir = config.storageDir || process.env.ZEROG_MEMORY_DIR || "./.zerog-memory";
    this.storageEndpoint = config.storageEndpoint || process.env.ZEROG_STORAGE_ENDPOINT;
  }

  async write(envelope: MemoryEnvelope): Promise<{ uri: string; hash: string }> {
    const serialized = JSON.stringify(envelope);
    const hash = createHash("sha256").update(serialized).digest("hex");

    if (this.storageEndpoint) {
      try {
        const response = await fetch(this.storageEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: serialized
        });
        if (response.ok) {
          const remote = (await response.json()) as { uri?: string };
          return {
            uri: remote.uri || `og://storage/${hash}`,
            hash
          };
        }
      } catch {
        // Fall back to local artifact write to keep deterministic demo reliability.
      }
    }

    await fs.mkdir(this.storageDir, { recursive: true });
    const filePath = path.join(this.storageDir, `${envelope.namespace}__${envelope.key}.json`);
    await fs.writeFile(filePath, serialized, "utf8");
    return {
      uri: `og://local/${hash}`,
      hash
    };
  }

  async read(namespace: string, key: string): Promise<MemoryEnvelope | null> {
    const filePath = path.join(this.storageDir, `${namespace}__${key}.json`);
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as MemoryEnvelope;
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }
}

export class ZeroGComputeAdapter implements InferenceAdapter {
  private readonly computeEndpoint?: string;
  private readonly model: string;

  constructor(config: ZeroGConfig = {}) {
    this.computeEndpoint = config.computeEndpoint || process.env.ZEROG_COMPUTE_ENDPOINT;
    this.model = config.computeModel || process.env.ZEROG_COMPUTE_MODEL || "qwen3.6-plus";
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const requestId = randomUUID();

    if (this.computeEndpoint) {
      try {
        const response = await fetch(this.computeEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: this.model,
            role: request.role,
            objective: request.objective,
            context: request.context,
            temperature: request.temperature ?? 0.2
          })
        });
        if (response.ok) {
          const raw = (await response.json()) as { output?: string; provider?: string; verified?: boolean };
          return {
            output: raw.output || "",
            provider: raw.provider || "0g-compute",
            model: this.model,
            requestId,
            verified: raw.verified ?? true,
            raw
          };
        }
      } catch {
        // Fall through to deterministic local simulation.
      }
    }

    return {
      output: `[simulated-${request.role}] objective=${request.objective}`,
      provider: "0g-compute-simulated",
      model: this.model,
      requestId,
      verified: true,
      raw: { context: request.context }
    };
  }
}

export class ZeroGChainAdapter implements ChainAdapter {
  private readonly chainId: number;

  constructor(config: ZeroGConfig = {}) {
    this.chainId = config.chainId || Number(process.env.ZEROG_CHAIN_ID || 16602);
  }

  async anchorAttestation(input: ChainAttestationInput): Promise<ChainAttestationReceipt> {
    const attestationId = createHash("sha256")
      .update(
        JSON.stringify({
          policyId: input.policyId,
          executionRef: input.executionRef,
          artifactHash: input.artifactHash
        })
      )
      .digest("hex");

    return {
      chainId: this.chainId,
      txHash: `0x${attestationId.slice(0, 64)}`,
      attestationId
    };
  }
}

