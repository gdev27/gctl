# Triple-Verified Flow

This project demonstrates the "triple-verified" architecture in one execution path.

## 1) Intent verification
- `runPolicyAndWorkflow` generates a signed intent message when `AGENT_PRIVATE_KEY` is configured.
- `PolicyClient.planAction` verifies signature recovery before policy planning.
- Failed signature checks return fail-closed deny with `INTENT_VERIFICATION_FAILED`.

## 2) Process integrity
- Policy input is validated by strict schema (`dsl/src/validate.ts`).
- The compiler emits deterministic policy graphs (`policy-engine/src/compiler.ts`).
- The engine is pure and deterministic for the same graph + request (`policy-engine/src/engine.ts`), including trace outputs.

## 3) Outcome anchoring
- The policy graph hash is anchored on-chain in `PolicyRegistry`.
- During planning, `PolicyClient` compares storage graph hash against on-chain hash.
- Workflow outcomes are reconciled and persisted with request fingerprint + policy ID + run IDs.
