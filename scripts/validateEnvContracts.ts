import { readFile } from "node:fs/promises";
import process from "node:process";
import path from "node:path";

type EnvSpec = {
  filePath: string;
  required: string[];
};

const rootDir = process.cwd();

const envSpecs: EnvSpec[] = [
  {
    filePath: path.join(rootDir, ".env.example"),
    required: [
      "BASE_SEPOLIA_RPC_URL",
      "DEPLOYER_PRIVATE_KEY",
      "POLICY_REGISTRY_ADDRESS",
      "FUND_ENS_NAME",
      "AGENT_ENS_NAME",
      "KEEPERHUB_API_URL",
      "KEEPERHUB_API_KEY"
    ]
  },
  {
    filePath: path.join(rootDir, "apps", "web", ".env.example"),
    required: ["NEXT_PUBLIC_INDEXER_URL", "INDEXER_URL"]
  }
];

const secretTokenPattern = /(PRIVATE_KEY|SECRET|TOKEN|JWT|PASSWORD|API_KEY)/i;

function parseEnvKeys(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=")[0]?.trim() ?? "")
    .filter(Boolean);
}

function ensurePublicNamespaceHasNoSecrets(keys: string[], scope: string): void {
  for (const key of keys) {
    if (key.startsWith("NEXT_PUBLIC_") && secretTokenPattern.test(key)) {
      throw new Error(`[${scope}] secret-like variable must not be public: ${key}`);
    }
  }
}

function ensureRequiredKeys(keys: string[], required: string[], scope: string): void {
  const keySet = new Set(keys);
  for (const requiredKey of required) {
    if (!keySet.has(requiredKey)) {
      throw new Error(`[${scope}] missing required env key in example: ${requiredKey}`);
    }
  }
}

function ensureRuntimeCompositionSafe(): void {
  for (const [key] of Object.entries(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_") && secretTokenPattern.test(key)) {
      throw new Error(`Unsafe runtime env composition: ${key} looks secret but is public.`);
    }
  }
}

async function main(): Promise<void> {
  for (const spec of envSpecs) {
    const raw = await readFile(spec.filePath, "utf8");
    const keys = parseEnvKeys(raw);
    const scope = path.relative(rootDir, spec.filePath);
    ensurePublicNamespaceHasNoSecrets(keys, scope);
    ensureRequiredKeys(keys, spec.required, scope);
  }

  ensureRuntimeCompositionSafe();

  console.log("Environment contracts validated:");
  for (const spec of envSpecs) {
    console.log(`- ${path.relative(rootDir, spec.filePath)}`);
  }
}

void main().catch((error: unknown) => {
  console.error("Environment contract validation failed.");
  console.error(error);
  process.exit(1);
});
