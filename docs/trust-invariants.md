# Trust Invariants

This document defines gctl's non-negotiable trust behavior. It is the canonical contract for security, runtime guarantees, and submission evidence.

Each invariant includes:
- **What must hold** (hard guarantee)
- **Failure behavior** (must fail closed or reject)
- **Proof path** (tests and evidence artifacts)

## INV-FAILCLOSED-001 Dependency failure denies execution

- **What must hold:** Policy planning denies when critical dependencies fail (ENS lookup, registry read, policy graph load/hash verify, authorization checks).
- **Failure behavior:** Returned plan is denied with dependency failure reason and explicit error code.
- **Proof path:**
  - `test/policyClient.failClosed.test.ts`
  - `docs/evidence/demo-deterministic.json`

## INV-POLICYHASH-001 Policy artifact integrity is checked before use

- **What must hold:** Policy graph hash is verified at load and before evaluation.
- **Failure behavior:** Evaluation must stop if digest mismatch is detected.
- **Proof path:**
  - `test/policyClient.failClosed.test.ts`
  - `docs/evidence/demo-deterministic.json`
  - `docs/security-model.md`

## INV-ENS-001 ENS identity passport uses reverse verification

- **What must hold:** Agent passport resolution verifies ENS forward and reverse linkage for identity confidence.
- **Failure behavior:** Authorization confidence is reduced and operations requiring trusted identity deny. When a `callerEnsName` is supplied to the primary planning path, `PolicyClient.planAction` fails closed if reverse verification is not trusted.
- **Proof path:**
  - `test/ensIdentityPassport.test.ts`
  - `test/policyClient.failClosed.test.ts`
  - `docs/evidence/ens-passport.txt`

## INV-ENS-002 ENS role and capability metadata is structured and present

- **What must hold:** Runtime-facing ENS records include role and capability metadata required for operator and compliance review.
- **Failure behavior:** Missing role metadata must be surfaced as degraded trust state and checklist/test failure.
- **Proof path:**
  - `test/ensIdentityPassport.test.ts`
  - `test/submissionTrustClaims.test.ts`
  - `docs/evidence/trust-evidence.json`

## INV-NOHARDCODE-001 Demo trust path does not rely on hardcoded live addresses

- **What must hold:** Demo-critical chain addresses and endpoint values come from environment/runtime config, not constants in scripts/routes.
- **Failure behavior:** Static hardcoded values in demo-critical paths fail the trust claims test suite.
- **Proof path:**
  - `test/submissionTrustClaims.test.ts`
  - `.env.example`
  - `web/.env.example`

## INV-WORKFLOW-001 KeeperHub workflow branches are policy-derived

- **What must hold:** Workflow selection is driven by policy path decisions (`safe`, `escalated`, `blocked`) and emitted with terminal state semantics.
- **Failure behavior:** Invalid mapping fails tests; missing status evidence marks submission incomplete.
- **Proof path:**
  - `test/workflowBranching.test.ts`
  - `test/submissionTrustClaims.test.ts`
  - `docs/evidence/demo-deterministic.json`

## INV-WORKFLOW-002 Reconciliation evidence includes run-level traceability

- **What must hold:** Workflow/run IDs, terminal states, and audit paths are discoverable through evidence artifacts and ops APIs.
- **Failure behavior:** Missing run traceability fails evidence validation.
- **Proof path:**
  - `test/submissionTrustClaims.test.ts`
  - `docs/evidence/schema/trust-evidence.schema.json`
  - `docs/evidence/trust-evidence.json`

## INV-ATTEST-001 Attestation mapping is explicit

- **What must hold:** Chain attestation evidence maps to deterministic execution context with a traceable tx hash or explicit simulated receipt marker.
- **Failure behavior:** Missing mapping fails evidence schema validation.
- **Proof path:**
  - `test/submissionTrustClaims.test.ts`
  - `docs/evidence/schema/trust-evidence.schema.json`
  - `docs/evidence/trust-evidence.json`

## INV-SOURCE-001 API and UI always disclose data source semantics

- **What must hold:** Ops BFF payloads include source semantics and trust status details so fallback data is never mistaken for live telemetry.
- **Failure behavior:** Responses missing trust source metadata fail API contract tests.
- **Proof path:**
  - `api/_lib/data.js`
  - `api/ops/*.js`
  - `web/src/hooks/useOpsEnvelope.js`
  - `web/src/components/trust/SourceBadge.jsx`, `web/src/components/trust/FallbackBanner.jsx`
  - `test/submissionTrustClaims.test.ts`
  - `docs/frontend-product-contract.md`

## INV-ENV-001 Public and secret env boundaries are enforced

- **What must hold:** Browser-exposed variables are restricted to the `VITE_*` namespace consumed by `web/`; private credentials (Vercel Function env: `INDEXER_URL`, `OPENAI_API_KEY`, signing keys, etc.) must never be consumable from the client env namespace.
- **Failure behavior:** Env contract validation fails startup/preflight.
- **Proof path:**
  - `scripts/validateEnvContracts.ts`
  - `test/submissionTrustClaims.test.ts`
  - `docs/operations.md`

## Invariant-to-submission mapping

- ENS checklist items map to: `INV-ENS-001`, `INV-ENS-002`, `INV-NOHARDCODE-001`
- KeeperHub checklist items map to: `INV-WORKFLOW-001`, `INV-WORKFLOW-002`
- 0G attestation checklist items map to: `INV-ATTEST-001`
- Fail-closed trust model maps to: `INV-FAILCLOSED-001`, `INV-POLICYHASH-001`, `INV-SOURCE-001`

## Change control

- Any change that weakens an invariant must:
  1. Update this document
  2. Update linked tests and evidence schema
  3. Update submission documents that reference the affected invariant IDs
