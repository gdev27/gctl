import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

import policySchema from "../schemas/policy.schema.json";
import { Policy, SUPPORTED_POLICY_SCHEMA_VERSIONS } from "../../policy-engine/src/types";

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
});
addFormats(ajv);

const validator = ajv.compile<Policy>(policySchema);

export class PolicyValidationError extends Error {
  public readonly details: string[];

  constructor(message: string, details: string[]) {
    super(message);
    this.name = "PolicyValidationError";
    this.details = details;
  }
}

export async function loadPolicyYaml(filePath: string): Promise<unknown> {
  const resolved = path.resolve(filePath);
  const raw = await fs.readFile(resolved, "utf8");
  return YAML.parse(raw);
}

export function validatePolicyObject(input: unknown): Policy {
  const valid = validator(input);
  if (!valid) {
    const details =
      validator.errors?.map((err) => `${err.instancePath || "/"} ${err.message || "validation_error"}`) || [];
    throw new PolicyValidationError("Policy validation failed.", details);
  }

  const policy = input as Policy;
  if (!SUPPORTED_POLICY_SCHEMA_VERSIONS.includes(policy.schema_version)) {
    throw new PolicyValidationError("Unsupported schema version.", [
      `schema_version ${policy.schema_version} is not in ${SUPPORTED_POLICY_SCHEMA_VERSIONS.join(", ")}`
    ]);
  }

  return policy;
}

export async function loadAndValidatePolicy(filePath: string): Promise<Policy> {
  const parsed = await loadPolicyYaml(filePath);
  return validatePolicyObject(parsed);
}
