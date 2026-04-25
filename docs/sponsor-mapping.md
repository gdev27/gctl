# Sponsor Feature Mapping

## KeeperHub (Primary Track)
- **Meaningful integration depth**
  - Workflow construction from policy decisions in `keeperhub-workflows/src/buildFromPlan.ts`.
  - Execution client abstraction (real HTTP client + deterministic mock) in `keeperhub-workflows/src/client.ts` and `keeperhub-workflows/src/client.mock.ts`.
  - Reconciliation with terminal states + persisted audit artifacts in `keeperhub-workflows/src/reconcile.ts`.
- **Utility**
  - Handles execution reliability concerns (status polling, terminal state normalization, audit trail generation).
- **Mergeable quality**
  - Tested behavior in `test/reconcile.test.ts` and `test/integration/criticalClaims.spec.ts`.

## ENS (Secondary Track)
- **Non-cosmetic identity usage**
  - Runtime policy discovery from ENS text records (`policy-id`, `policy-registry`, `policy-registry-chain-id`) in `agent-sdk/src/ensResolver.ts`.
  - Agent authorization check via ENS agent-registration record.
  - ENS `execution-profile` text record directly alters runtime routing behavior (`standard` vs `private-only`) in `agent-sdk/src/client.ts`.
- **Functional demo evidence**
  - ENS records are written by `ens-identity/scripts/setEnsRecords.ts`.
  - Demo path consumes those records in policy planning (`scripts/demoDeterministic.ts`).

## Open Agents Judging Criteria Mapping
- **Technical depth**
  - On-chain anchoring + off-chain deterministic policy engine + execution reconciliation.
- **Originality**
  - Institutional policy OS pattern for agentic execution with fail-closed controls.
- **Ecosystem impact**
  - Reusable architecture: policy DSL, planning SDK, and execution adapter patterns.
