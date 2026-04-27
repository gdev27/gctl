# Extension Cookbook

This cookbook shows how to extend Institutional Policy OS v2 without forking core logic.

## 1) Add a new inference backend

1. Implement `InferenceAdapter` from `agent-sdk/src/adapters.ts`.
2. Return provider/model/request metadata in every response.
3. Add fallback behavior so failure causes policy deny, not unsafe execution.
4. Add tests in `test/` for success and timeout/error handling.

## 2) Add a new identity provider

1. Implement `IdentityAdapter`.
2. Preserve the passport shape (`role`, `capabilities`, and verification fields).
3. Keep authorization checks deterministic.
4. Add integration docs to `docs/sponsor-mapping.md`.

## 3) Add a new execution backend

1. Implement `ExecutionAdapter`.
2. Preserve reconciliation outputs (`state`, `auditPath`, and analytics).
3. Ensure blocked plans are not submitted.
4. Add failure-injection tests validating retries and terminal states.

## 4) Add a new swarm role

1. Define role objective and constraints.
2. Add role identity metadata in ENS setup script.
3. Persist role traces in shared memory.
4. Update demo script to include role output in final proof bundle.

## 5) Add a custom policy plugin

1. Extend policy DSL schema.
2. Extend compiler output to deterministic graph nodes.
3. Extend engine evaluation while preserving fail-closed defaults.
4. Add regression tests for deterministic hashing and routing behavior.

