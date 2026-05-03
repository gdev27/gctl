# gctl

gctl is an open-source framework and reference implementation for policy-constrained autonomous agents that can safely move value onchain.

It combines deterministic policy evaluation, verifiable identity, and reliability-aware execution so an autonomous agent can explain why it acted, prove which constraints applied, and fail closed when trust dependencies are unavailable.

Built by Gaurav Dev.

## Submission Snapshot

- Live web demo: https://gctl.vercel.app
- Public repo: https://github.com/gdev27/gctl
- Primary judge command: `npm run judge:preflight`
- Submission pack: `docs/submission-pack.md`
- Trust invariants: `docs/trust-invariants.md`
- Evidence artifacts: `docs/evidence/`

The repeatable judging path is `npm run judge:preflight`. It validates env contracts and evidence schema, compiles contracts, runs tests and typecheck, then captures deterministic, swarm, and ENS passport outputs under `docs/evidence/preflight/`.

## Why It Matters

Most agent demos can propose an action. Production onchain agents need more:

- **Trust:** operators need evidence for how a decision was produced.
- **Governance:** autonomous behavior must remain inside declared policy.
- **Identity:** agent roles need accountable names, metadata, and authorization.
- **Reliability:** execution must route through auditable workflows with terminal states.

gctl packages those guarantees as a reusable `PolicyGraph SDK` plus a flagship `TreasuryTwin Swarm` reference app.

## How It Works

1. A user or operator submits an objective.
2. The planner and researcher create a policy-aware proposal.
3. The critic challenges the proposal and can veto unsafe paths.
4. The policy engine evaluates deterministic constraints.
5. ENS identity checks verify role and authority metadata, including fail-closed reverse verification for caller ENS names.
6. 0G adapters provide compute preflight, encrypted-at-rest memory artifacts, optional SDK-backed storage retrieval, and simulated/onchain attestation mapping.
7. KeeperHub routes approved actions through safe or escalated workflows and records run evidence.

The key invariant: if identity, policy integrity, evidence, or execution dependencies cannot be trusted, gctl denies or degrades explicitly instead of pretending the path is healthy.

## Sponsor Alignment

- **0G Framework, Tooling & Extensions:** adapter-based compute, storage, and chain attestation surfaces with deterministic fallback and optional live 0G SDK paths.
- **0G Autonomous Agents & Swarms:** planner, researcher, critic, and executor roles with shared memory and reflection.
- **ENS Integration + Creative ENS:** identity passports, role/subname metadata, authorization, execution-profile routing, and reverse verification.
- **KeeperHub Best Use:** policy-derived workflow branches, retries, run logs, reconciliation, and analytics.

See `docs/sponsor-mapping.md` for the full mapping.

## Quickstart

```bash
npm install
cp .env.example .env
npm run judge:preflight
```

For the Vite operator console:

```bash
npm ci --prefix web
npm run web:dev
```

Local Vite development uses same-origin `/api/*` routes only in Vercel production. When those functions are not available locally, the SPA renders explicit fallback trust envelopes so demo data is not confused with live telemetry.

## Verification Commands

```bash
npm run validate:env
npm run validate:evidence
npm run hh:compile
npm run test
npm run typecheck
npm run verify
npm run judge:preflight
npm run web:lint
npm run web:typecheck
npm run web:build
```

If `npm run compile:policy` or `npm run demo:init` is run against an already-initialized deployed `PolicyRegistry`, the registry can return `policy_exists`. That is an idempotency condition for setup flows, not the repeatable judge path. Use `npm run judge:preflight`, `npm run demo:deterministic`, and `npm run demo:swarm` for repeatable evaluation.

## Demo Commands

```bash
npm run demo:deterministic
npm run demo:swarm
npm run ens:passport
```

The deterministic demo shows safe, escalated, and blocked policy branches in `docs/evidence/demo-deterministic.json`. The swarm demo captures planner, researcher, critic, and executor traces in `docs/evidence/demo-swarm.json`.

## Evidence Map

- Trust claim matrix: `docs/submission-pack.md`
- Final checklist: `docs/submission-checklist.md`
- Deployment addresses: `docs/deployments.md`
- Structured trust evidence: `docs/evidence/trust-evidence.json`
- Judge preflight report: `docs/evidence/judge-preflight-report.md`
- ENS passport output: `docs/evidence/ens-passport.txt`
- Architecture: `docs/architecture.md`
- 0G storage SDK / Hardhat `ethers` peers: `docs/zerog-storage-sdk-peer.md`, operator env install: `docs/zerog-storage-operators.md`, workspace isolation options: `docs/workspace-isolation.md`
- Security model: `docs/security-model.md`
- Operations runbook: `docs/operations.md`
- Video script: `docs/video-script.md`
- 115-second voiceover: `docs/video-voiceover-115s.md`
- KeeperHub actionable feedback: `KEEPERHUB_FEEDBACK.md`

## Repository Map

- `contracts/`: onchain policy registry and attestation contracts.
- `dsl/`: policy schema, validation, and sample policies.
- `policy-engine/`: deterministic policy compiler and evaluator.
- `agent-sdk/`: agent client, adapters, ENS identity, 0G, and KeeperHub connectors.
- `keeperhub-workflows/`: workflow routing, execution, reconciliation, and analytics.
- `ens-identity/`: ENS metadata and role/subname scripts.
- `indexer/`: indexed state and compliance API scaffold.
- `api/`: Vercel Functions for `/api/ops/*` trust envelopes and `/api/functions/debate-policy`.
- `web/`: Vite + React 18 SPA operator console, marketing site, and policy builder.
- `scripts/`: deployment, validation, preflight, and deterministic demo scripts.
- `test/`: unit, integration, and submission trust tests.
- `examples/`: open-source reference scenarios and starter templates.

## Environment Boundaries

Root `.env.example` documents server, chain, ENS, KeeperHub, and 0G variables. `web/.env.example` documents the browser boundary for the Vite app. Browser-exposed values must use `VITE_*`; secrets, private keys, API keys, JWTs, tokens, and server-only endpoints must never be placed in that namespace.
