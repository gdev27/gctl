export type PolicyClientErrorCode =
  | "ENS_LOOKUP_FAILED"
  | "ENS_RECORD_MALFORMED"
  | "ENS_REVERSE_VERIFICATION_FAILED"
  | "AGENT_NOT_AUTHORIZED"
  | "REGISTRY_READ_FAILED"
  | "POLICY_NOT_ACTIVE"
  | "STORAGE_LOAD_FAILED"
  | "POLICY_HASH_MISMATCH"
  | "POLICY_EVALUATION_FAILED"
  | "TIMEOUT";

export class PolicyClientError extends Error {
  constructor(public readonly code: PolicyClientErrorCode, message: string) {
    super(message);
    this.name = "PolicyClientError";
  }
}
