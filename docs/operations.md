# Operations Runbook

This runbook is for **anyone who runs gctl**: local developers, integration engineers, and operators preparing a demo or production-like environment. It complements [`security-model.md`](./security-model.md) (roles and fail-closed semantics) and [`trust-invariants.md`](./trust-invariants.md) (formal `INV-*` guarantees).

Canonical invariant IDs referenced below live in [`trust-invariants.md`](./trust-invariants.md).

---

## Day one: from clone to a green preflight

Use this path the first time you touch the repo—or after pulling a large change.

1. **Install and env**
   - `npm install`
   - `cp .env.example .env` and fill RPC, registry, ENS names, and any optional 0G / KeeperHub values (see [`.env.example`](../.env.example) comments).
   - For the web app: `cp web/.env.example web/.env` if you run the Vite console; keep **secrets out of `VITE_*`** ([`INV-ENV-001`](./trust-invariants.md)).

2. **Prove the contract**
   - `npm run validate:env` — fails fast if browser/server env boundaries are wrong.
   - `npm run verify` — Hardhat compile, Vitest, typecheck, env + evidence schema ([`INV-ENV-001`](./trust-invariants.md), evidence validation).

3. **Submission-style gate (optional but recommended before demos or PRs)**
   - `npm run judge:preflight` — same family of checks plus captured outputs under [`docs/evidence/preflight/`](./evidence/preflight/) and [`docs/evidence/judge-preflight-report.md`](./evidence/judge-preflight-report.md).

4. **Operator UI (optional)**
   - `npm ci --prefix web` then `npm run web:dev`
   - Remember: same-origin `/api/*` is **production-shaped on Vercel**; locally the SPA may show **fallback** trust envelopes—read [`frontend-product-contract.md`](./frontend-product-contract.md) and [`INV-SOURCE-001`](./trust-invariants.md).

5. **If something fails**
   - Planning denies with explicit codes → see **Fail-closed guarantees** in [`security-model.md`](./security-model.md) and [`INV-FAILCLOSED-001`](./trust-invariants.md).
   - ENS / identity → [`INV-ENS-001`](./trust-invariants.md), [`INV-ENS-002`](./trust-invariants.md); sample output [`docs/evidence/ens-passport.txt`](./evidence/ens-passport.txt).
   - Evidence schema → `npm run validate:evidence`; structured file [`docs/evidence/trust-evidence.json`](./evidence/trust-evidence.json).

6. **Clean local runtime before sharing a tree or opening a PR**
   - `npm run clean:runtime` (see [`CONTRIBUTING.md`](../CONTRIBUTING.md) for what must not be committed).

**Addresses and explorers** for deployed contracts live in [`deployments.md`](./deployments.md).

---

## Emergency pause drill

1. Guardian multisig executes `PolicyRegistry.pause()`.
2. Confirm contract paused state.
3. Verify policy mutations fail in tests and monitoring.
4. Investigate incident, prepare mitigation.
5. Admin executes `unpause()` after approval.

---

## Key rotation SOP

1. Generate new agent key in secure vault.
2. Update runtime secrets:
   - `AGENT_PRIVATE_KEY`
   - `AGENT_KEY_VERSION`
3. Restart agent runtime and verify signed health transaction.
4. Disable previous key.

---

## Reconciliation monitoring

- Track terminal states:
  - `succeeded`, `reverted`, `partial_fill`, `timed_out`, `cancelled`.
- Alerts for `reverted` / `timed_out`.
- Store audit log path and index into compliance API.

Workflow traceability expectations align with [`INV-WORKFLOW-001`](./trust-invariants.md) and [`INV-WORKFLOW-002`](./trust-invariants.md).

---

## Environment contract and startup checks

1. Keep browser-exposed variables in `web/.env.example` under `VITE_*` (Vite's public namespace). Server-only secrets used by Vercel Functions live in the project-level Vercel env (e.g. `INDEXER_URL`, `OPENAI_API_KEY`, `FUND_ENS_NAME`) and must never appear under `VITE_*`.
2. Never place secret-like keys (`*_PRIVATE_KEY`, `*_TOKEN`, `*_SECRET`, `*_JWT`, `*_API_KEY`) in the `VITE_*` namespace.
3. Validate env contracts before judge/demo runs:
   - `npm run validate:env`
4. Demo-critical ENS identity values must be explicit:
   - `FUND_ENS_NAME`
   - `AGENT_ENS_NAME`
5. Deterministic demo scripts fail loudly when required env keys are missing; they do not silently fall back to hardcoded trust identities ([`INV-NOHARDCODE-001`](./trust-invariants.md)).
6. Run full judge preflight before submission:
   - `npm run judge:preflight`
   - Review `docs/evidence/judge-preflight-report.md`

---

## Quick reference: commands

| Goal | Command |
| --- | --- |
| Env boundary check | `npm run validate:env` |
| Evidence schema check | `npm run validate:evidence` |
| Standard CI-style gate | `npm run verify` |
| Submission / judge bundle | `npm run judge:preflight` |
| Strip local runtime artifacts | `npm run clean:runtime` |

---

*When ops behavior or env keys change, update this file and root [`README.md`](../README.md) in the same change.*
