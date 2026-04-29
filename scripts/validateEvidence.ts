import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Ajv2020, { AnySchema } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const rootDir = process.cwd();
const schemaPath = path.join(rootDir, "docs", "evidence", "schema", "trust-evidence.schema.json");
const evidencePath = path.join(rootDir, "docs", "evidence", "trust-evidence.json");

async function loadJson(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main(): Promise<void> {
  const [schema, evidence] = await Promise.all([loadJson(schemaPath), loadJson(evidencePath)]);

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema as AnySchema);
  const valid = validate(evidence);

  if (!valid) {
    console.error("Evidence validation failed:");
    for (const err of validate.errors ?? []) {
      const pointer = err.instancePath || "/";
      console.error(`- ${pointer} ${err.message ?? "invalid"}`);
    }
    process.exit(1);
  }

  console.log("Evidence validation passed:");
  console.log(`- schema: ${path.relative(rootDir, schemaPath)}`);
  console.log(`- evidence: ${path.relative(rootDir, evidencePath)}`);
}

void main().catch((error: unknown) => {
  console.error("Evidence validation crashed.");
  console.error(error);
  process.exit(1);
});
