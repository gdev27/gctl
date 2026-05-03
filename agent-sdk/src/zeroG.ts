import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
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
  storageDownloadUrl?: string;
  storageIndexerUrl?: string;
  storageRpcUrl?: string;
  storagePrivateKey?: string;
  memoryEncryptionKey?: string;
  computeEndpoint?: string;
  computeModel?: string;
  chainId?: number;
  attestationMode?: "simulated" | "onchain";
  attestationContractAddress?: string;
  attestationRpcUrl?: string;
  attestationPrivateKey?: string;
};

type MemoryIndexEntry = {
  namespace: string;
  key: string;
  uri: string;
  hash: string;
  localPath?: string;
  remoteRoot?: string;
  tier: "local" | "remote" | "mixed";
  encryptedAtRest: boolean;
  writtenAt: string;
};

type MemoryIndex = {
  version: 1;
  entries: Record<string, MemoryIndexEntry>;
};

type StoredEncryptedEnvelope = {
  version: 1;
  namespace: string;
  key: string;
  encrypted: true;
  createdAt: string;
  crypto: {
    alg: "AES-256-GCM";
    iv: string;
    tag: string;
    data: string;
  };
};

type StoredPlainEnvelope = MemoryEnvelope & {
  version?: 1;
};

function safeSegment(value: string): string {
  return encodeURIComponent(value).replace(/%/g, "_");
}

function indexKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

function normalizeEncryptionKey(rawKey?: string): Buffer {
  const source =
    rawKey ||
    process.env.ZEROG_MEMORY_ENCRYPTION_KEY ||
    process.env.AUDIT_LOG_ENCRYPTION_KEY ||
    "gctl-zero-g-memory-local-development-key";
  if (/^[a-fA-F0-9]{64}$/.test(source)) {
    return Buffer.from(source, "hex");
  }
  const base64 = Buffer.from(source, "base64");
  if (base64.length === 32) {
    return base64;
  }
  return createHash("sha256").update(source).digest();
}

function extractRootFromUri(uri: string): string | undefined {
  const match = uri.match(/^og:\/\/storage\/(.+)$/);
  return match?.[1];
}

async function importZeroGStorageSdk(): Promise<any> {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<any>;
  return dynamicImport("@0gfoundation/0g-storage-ts-sdk");
}

export class ZeroGMemoryAdapter implements MemoryAdapter {
  private readonly storageDir: string;
  private readonly storageEndpoint?: string;
  private readonly storageDownloadUrl?: string;
  private readonly storageIndexerUrl?: string;
  private readonly storageRpcUrl?: string;
  private readonly storagePrivateKey?: string;
  private readonly encryptionKey: Buffer;

  constructor(config: ZeroGConfig = {}) {
    this.storageDir = config.storageDir || process.env.ZEROG_MEMORY_DIR || "./.zerog-memory";
    this.storageEndpoint = config.storageEndpoint || process.env.ZEROG_STORAGE_ENDPOINT;
    this.storageDownloadUrl = config.storageDownloadUrl || process.env.ZEROG_STORAGE_DOWNLOAD_URL;
    this.storageIndexerUrl = config.storageIndexerUrl || process.env.ZEROG_STORAGE_INDEXER_URL;
    this.storageRpcUrl = config.storageRpcUrl || process.env.ZEROG_STORAGE_RPC_URL || process.env.ZEROG_CHAIN_RPC_URL;
    this.storagePrivateKey = config.storagePrivateKey || process.env.ZEROG_STORAGE_PRIVATE_KEY;
    this.encryptionKey = normalizeEncryptionKey(config.memoryEncryptionKey);
  }

  private fileName(namespace: string, key: string): string {
    return `${safeSegment(namespace)}__${safeSegment(key)}.json`;
  }

  private filePath(namespace: string, key: string): string {
    return path.join(this.storageDir, this.fileName(namespace, key));
  }

  private legacyFilePath(namespace: string, key: string): string {
    return path.join(this.storageDir, `${namespace}__${key}.json`);
  }

  private indexPath(): string {
    return path.join(this.storageDir, ".memory-index.json");
  }

  private async readIndex(): Promise<MemoryIndex> {
    try {
      const raw = await fs.readFile(this.indexPath(), "utf8");
      return JSON.parse(raw) as MemoryIndex;
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        return { version: 1, entries: {} };
      }
      throw error;
    }
  }

  private async writeIndex(index: MemoryIndex): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });
    const target = this.indexPath();
    const temp = `${target}.${randomUUID()}.tmp`;
    await fs.writeFile(temp, JSON.stringify(index, null, 2), "utf8");
    await fs.rename(temp, target);
  }

  private serializeForStorage(envelope: MemoryEnvelope): string {
    if (!envelope.encrypted) {
      const stored: StoredPlainEnvelope = { ...envelope, version: 1 };
      return JSON.stringify(stored);
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    const plaintext = JSON.stringify(envelope);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const stored: StoredEncryptedEnvelope = {
      version: 1,
      namespace: envelope.namespace,
      key: envelope.key,
      encrypted: true,
      createdAt: envelope.createdAt,
      crypto: {
        alg: "AES-256-GCM",
        iv: iv.toString("base64"),
        tag: cipher.getAuthTag().toString("base64"),
        data: encrypted.toString("base64")
      }
    };
    return JSON.stringify(stored);
  }

  private deserializeFromStorage(raw: string): MemoryEnvelope {
    const parsed = JSON.parse(raw) as StoredEncryptedEnvelope | StoredPlainEnvelope;
    if ("crypto" in parsed && parsed.encrypted) {
      const decipher = createDecipheriv("aes-256-gcm", this.encryptionKey, Buffer.from(parsed.crypto.iv, "base64"));
      decipher.setAuthTag(Buffer.from(parsed.crypto.tag, "base64"));
      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(parsed.crypto.data, "base64")),
        decipher.final()
      ]).toString("utf8");
      return JSON.parse(plaintext) as MemoryEnvelope;
    }
    return {
      namespace: parsed.namespace,
      key: parsed.key,
      payload: parsed.payload,
      encrypted: parsed.encrypted,
      createdAt: parsed.createdAt
    };
  }

  private async uploadViaSdk(filePath: string): Promise<{ uri: string; remoteRoot: string } | null> {
    if (!this.storageIndexerUrl || !this.storageRpcUrl || !this.storagePrivateKey) {
      return null;
    }

    try {
      const sdk = await importZeroGStorageSdk();
      const provider = new JsonRpcProvider(this.storageRpcUrl);
      const signer = new Wallet(this.storagePrivateKey, provider);
      const indexer = new sdk.Indexer(this.storageIndexerUrl);
      const file = await sdk.ZgFile.fromFilePath(filePath);
      try {
        const [tree, treeErr] = await file.merkleTree();
        if (treeErr) {
          throw treeErr;
        }
        const remoteRoot = tree.rootHash();
        const [, uploadErr] = await indexer.upload(file, this.storageRpcUrl, signer);
        if (uploadErr) {
          throw uploadErr;
        }
        return { uri: `og://storage/${remoteRoot}`, remoteRoot };
      } finally {
        await file.close?.();
      }
    } catch {
      return null;
    }
  }

  private async uploadViaHttp(serialized: string, hash: string): Promise<{ uri: string; remoteRoot?: string } | null> {
    if (!this.storageEndpoint) {
      return null;
    }

    try {
      const response = await fetch(this.storageEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: serialized
      });
      if (!response.ok) {
        return null;
      }
      const remote = (await response.json()) as { uri?: string; root?: string; rootHash?: string };
      const remoteRoot = remote.root || remote.rootHash || extractRootFromUri(remote.uri || "");
      return {
        uri: remote.uri || `og://storage/${remoteRoot || hash}`,
        remoteRoot
      };
    } catch {
      return null;
    }
  }

  private async downloadRemote(entry: MemoryIndexEntry): Promise<string | null> {
    const root = entry.remoteRoot || extractRootFromUri(entry.uri);
    if (root && this.storageIndexerUrl) {
      try {
        const sdk = await importZeroGStorageSdk();
        const indexer = new sdk.Indexer(this.storageIndexerUrl);
        const filePath = this.filePath(entry.namespace, entry.key);
        const err = await indexer.download(root, filePath, true);
        if (err) {
          throw err;
        }
        return fs.readFile(filePath, "utf8");
      } catch {
        return null;
      }
    }

    if (this.storageDownloadUrl) {
      try {
        const url = new URL(this.storageDownloadUrl);
        url.searchParams.set("uri", entry.uri);
        const response = await fetch(url);
        if (response.ok) {
          return response.text();
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  async write(envelope: MemoryEnvelope): Promise<{ uri: string; hash: string }> {
    const serialized = JSON.stringify(envelope);
    const hash = createHash("sha256").update(serialized).digest("hex");
    const stored = this.serializeForStorage(envelope);
    await fs.mkdir(this.storageDir, { recursive: true });
    const filePath = this.filePath(envelope.namespace, envelope.key);
    await fs.writeFile(filePath, stored, "utf8");

    const sdkUpload = await this.uploadViaSdk(filePath);
    const httpUpload = sdkUpload ? null : await this.uploadViaHttp(stored, hash);
    const remote = sdkUpload || httpUpload;
    const entry: MemoryIndexEntry = {
      namespace: envelope.namespace,
      key: envelope.key,
      uri: remote?.uri || `og://local/${hash}`,
      hash,
      localPath: filePath,
      remoteRoot: remote?.remoteRoot,
      tier: remote ? "mixed" : "local",
      encryptedAtRest: envelope.encrypted,
      writtenAt: new Date().toISOString()
    };
    const index = await this.readIndex();
    index.entries[indexKey(envelope.namespace, envelope.key)] = entry;
    await this.writeIndex(index);

    return { uri: entry.uri, hash };
  }

  async read(namespace: string, key: string): Promise<MemoryEnvelope | null> {
    const index = await this.readIndex();
    const entry = index.entries[indexKey(namespace, key)];
    const candidates = [
      entry?.localPath,
      this.filePath(namespace, key),
      this.legacyFilePath(namespace, key)
    ].filter(Boolean) as string[];

    for (const filePath of candidates) {
      try {
        const raw = await fs.readFile(filePath, "utf8");
        return this.deserializeFromStorage(raw);
      } catch (error) {
        const e = error as NodeJS.ErrnoException;
        if (e.code !== "ENOENT") {
          throw error;
        }
      }
    }

    if (entry) {
      const remote = await this.downloadRemote(entry);
      if (remote) {
        return this.deserializeFromStorage(remote);
      }
      if (entry.tier !== "local") {
        throw new Error(`0g_memory_remote_unavailable:${entry.uri}`);
      }
    }

    try {
      const raw = await fs.readFile(this.legacyFilePath(namespace, key), "utf8");
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
  private readonly mode: "simulated" | "onchain";
  private readonly contractAddress?: string;
  private readonly rpcUrl?: string;
  private readonly privateKey?: string;

  constructor(config: ZeroGConfig = {}) {
    this.chainId = config.chainId || Number(process.env.ZEROG_CHAIN_ID || 16602);
    this.mode = config.attestationMode || (process.env.ZEROG_ATTESTATION_MODE as "simulated" | "onchain" | undefined) || "simulated";
    this.contractAddress = config.attestationContractAddress || process.env.ZEROG_ATTESTATION_CONTRACT_ADDRESS;
    this.rpcUrl = config.attestationRpcUrl || process.env.ZEROG_CHAIN_RPC_URL || process.env.ZEROG_ATTESTATION_RPC_URL;
    this.privateKey = config.attestationPrivateKey || process.env.ZEROG_ATTESTATION_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
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

    if (this.mode === "onchain") {
      if (!this.contractAddress || !this.rpcUrl || !this.privateKey) {
        throw new Error("ZEROG_ATTESTATION_CONTRACT_ADDRESS, ZEROG_CHAIN_RPC_URL, and signer key are required");
      }
      const provider = new JsonRpcProvider(this.rpcUrl);
      const signer = new Wallet(this.privateKey, provider);
      const contract = new Contract(
        this.contractAddress,
        ["function anchorAttestation(bytes32 attestationId,string policyId,string executionRef,bytes32 artifactHash) returns (bytes32)"],
        signer
      );
      const tx = await contract.anchorAttestation(
        `0x${attestationId}`,
        input.policyId,
        input.executionRef,
        `0x${input.artifactHash.replace(/^0x/, "").padStart(64, "0").slice(0, 64)}`
      );
      const receipt = await tx.wait();
      const txHash = receipt?.hash || tx.hash;
      const explorerBase =
        this.chainId === 16661 ? "https://chainscan.0g.ai/tx" : "https://chainscan-galileo.0g.ai/tx";
      return {
        kind: "onchain",
        chainId: this.chainId,
        txHash,
        attestationId,
        receipt: `onchain-attestation:${txHash}`,
        explorerUrl: `${explorerBase}/${txHash}`
      };
    }

    return {
      kind: "simulated",
      chainId: this.chainId,
      attestationId,
      receipt: `simulated-attestation:${attestationId}`
    };
  }
}

