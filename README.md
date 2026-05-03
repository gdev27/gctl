# gctl

**Policy-constrained autonomous agents for accountable onchain execution.**

gctl is an open-source framework and reference implementation: deterministic policy evaluation, verifiable identity (ENS), reliability-aware routing (KeeperHub), and optional 0G compute, storage, and attestation surfaces, wired so an agent can **explain** why it acted, **prove** which constraints applied, and **fail closed** when trust dependencies are missing or untrusted.

Built by [Gaurav Dev](https://x.com/gdev27).

---

## Contents

- [Why gctl exists](#why-gctl-exists)
- [Design in four pillars](#design-in-four-pillars)
- [How a decision travels through the stack](#how-a-decision-travels-through-the-stack)
- [Submission snapshot](#submission-snapshot)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Operator console (web)](#operator-console-web)
- [Verification and judging](#verification-and-judging)
- [Demo commands](#demo-commands)
- [Evidence map](#evidence-map)
- [Repository layout](#repository-layout)
- [Documentation](#documentation)
- [Sponsor alignment](#sponsor-alignment)
- [Environment boundaries](#environment-boundaries)
- [Contributing](#contributing)

---

## Why gctl exists

Most agent demos can *propose* an action. Production systems that move value need **governance**, **identity**, **evidence**, and **terminal semantics** for execution.

| Gap in typical demos | What gctl adds |
| --- | --- |
| “The model said so” | **Deterministic policy graph** compiled and evaluated the same way every run; hashes anchored and checked. |
| Anonymous automation | **ENS passports** with structured roles, forward/reverse verification, and fail-closed paths when identity is not trusted. |
| Fire-and-forget txs | **KeeperHub workflows**: policy-derived branches (`safe`, `escalated`, `blocked`), retries, reconciliation, and auditable run records. |
| Opaque infrastructure | **Explicit trust envelopes** in ops APIs and the UI (`live` vs `fallback`, `trustStatus`, recovery hints) so operators never confuse synthetic snapshots with live telemetry. |

The invariant: **if identity, policy integrity, evidence, or execution dependencies cannot be trusted, gctl denies or degrades explicitly**; it does not silently pretend the path is healthy.

---

## Design in four pillars

1. **Policy (the law):** YAML-style policy DSL, compiler, and `policy-engine` evaluator. Onchain `PolicyRegistry` anchors canonical policy hashes. See [`docs/policy-dsl.md`](docs/policy-dsl.md) and [`docs/architecture.md`](docs/architecture.md).

2. **Identity (who may act):** ENS resolution, role/subname metadata, identity passport generation, and reverse verification on the critical planning path. See [`docs/trust-invariants.md`](docs/trust-invariants.md) (`INV-ENS-*`).

3. **Execution (how value moves):** KeeperHub routing, execution, reconciliation, encrypted audit fields, and analytics-shaped summaries. See [`keeperhub-workflows/`](keeperhub-workflows/) and [`docs/operations.md`](docs/operations.md).

4. **Evidence (how you prove it):** Schema-validated trust artifacts, judge preflight outputs, and deterministic demo JSON under [`docs/evidence/`](docs/evidence/). See [`docs/submission-pack.md`](docs/submission-pack.md).

Optional **0G** adapters add compute preflight, encrypted-at-rest memory, storage-backed policy URIs, and simulated or onchain attestation mapping, without breaking the deterministic judging path. See [`docs/adapter-contracts.md`](docs/adapter-contracts.md) and [`docs/sponsor-mapping.md`](docs/sponsor-mapping.md).

---

## How a decision travels through the stack

Think of it as a **pipeline with veto points**, not a single LLM call:

1. An operator or autonomous **objective** enters the system (CLI, SDK, or swarm).
2. **Planner** and **researcher** shape a policy-aware proposal; **critic** can veto unsafe paths.
3. **Policy engine** evaluates deterministic constraints against the loaded graph (integrity-checked).
4. **ENS** checks resolve role metadata; **reverse verification** applies when a caller ENS name is in play (see trust invariants).
5. **0G adapters** (when configured) handle compute preflight, memory artifacts, optional SDK storage, and attestation receipts (`simulated` vs `onchain`).
6. **KeeperHub** runs approved actions on the right workflow branch and records evidence through reconciliation.

For a visual end-to-end diagram (Mermaid), open **[`docs/architecture.md`](docs/architecture.md)**.

---

## Submission snapshot

| Asset | Location |
| --- | --- |
| Live web demo | https://gctl.vercel.app |
| Public repository | https://github.com/gdev27/gctl |
| Primary judge command | `npm run judge:preflight` |
| Submission pack (links, matrix, status) | [`docs/submission-pack.md`](docs/submission-pack.md) |
| Trust invariants (canonical contract) | [`docs/trust-invariants.md`](docs/trust-invariants.md) |
| Captured evidence | [`docs/evidence/`](docs/evidence/) |

**Repeatable judging:** `npm run judge:preflight` validates env contracts and evidence schema, compiles contracts, runs tests and typecheck, then captures deterministic, swarm, and ENS passport outputs under `docs/evidence/preflight/`.

---

## Prerequisites

- **Node.js** `>=22 <23` (see root `package.json` `engines`).
- **npm** at the version you use for CI (lockfile-friendly installs recommended for `web/`).

---

## Quickstart

```bash
npm install
cp .env.example .env
# Edit .env for your RPC, registry, ENS, and optional 0G / KeeperHub settings.
npm run judge:preflight
```

For a full local quality gate without the judge harness:

```bash
npm run verify
```

---

## Operator console (web)

The Vite + React 18 SPA under [`web/`](web/) is the operator console and marketing surface (deployed at https://gctl.vercel.app).

```bash
npm ci --prefix web
npm run web:dev
```

**Local API behavior:** same-origin `/api/*` routes are available in **Vercel production**. Locally, those functions may be absent; the UI then renders **explicit fallback trust envelopes** so demo data is never mistaken for live indexer telemetry. Product semantics for `source`, `trustStatus`, and banners are documented in [`docs/frontend-product-contract.md`](docs/frontend-product-contract.md).

Pre-merge checks often used in CI:

```bash
npm run web:lint
npm run web:typecheck
npm run web:build
```

---

## Verification and judging

**Core repo**

```bash
npm run validate:env
npm run validate:evidence
npm run hh:compile
npm run test
npm run typecheck
npm run verify
npm run judge:preflight
```

**Web app**

```bash
npm run web:lint
npm run web:typecheck
npm run web:build
```

**Idempotency note:** If `npm run compile:policy` or `npm run demo:init` is run against an already-initialized deployed `PolicyRegistry`, the registry may return `policy_exists`. That is an **idempotency** signal for setup flows, not the same as the repeatable judge path. For repeatable evaluation prefer `npm run judge:preflight`, `npm run demo:deterministic`, and `npm run demo:swarm`.

---

## Demo commands

```bash
npm run demo:deterministic
npm run demo:swarm
npm run ens:passport
```

- **Deterministic demo:** safe, escalated, and blocked policy branches in [`docs/evidence/demo-deterministic.json`](docs/evidence/demo-deterministic.json).
- **Swarm demo:** planner, researcher, critic, and executor traces in [`docs/evidence/demo-swarm.json`](docs/evidence/demo-swarm.json).
- Step-by-step narrative: [`docs/demo-flows.md`](docs/demo-flows.md).

---

## Evidence map

| Topic | Doc |
| --- | --- |
| Trust claim matrix and submission links | [`docs/submission-pack.md`](docs/submission-pack.md) |
| Final checklist | [`docs/submission-checklist.md`](docs/submission-checklist.md) |
| Deployment addresses and explorers | [`docs/deployments.md`](docs/deployments.md) |
| Structured trust evidence (JSON) | [`docs/evidence/trust-evidence.json`](docs/evidence/trust-evidence.json) |
| Judge preflight report | [`docs/evidence/judge-preflight-report.md`](docs/evidence/judge-preflight-report.md) |
| ENS passport sample output | [`docs/evidence/ens-passport.txt`](docs/evidence/ens-passport.txt) |
| Architecture (diagram + boundaries) | [`docs/architecture.md`](docs/architecture.md) |
| 0G storage SDK / Hardhat `ethers` peers | [`docs/zerog-storage-sdk-peer.md`](docs/zerog-storage-sdk-peer.md), [`docs/zerog-storage-operators.md`](docs/zerog-storage-operators.md) |
| Workspace isolation | [`docs/workspace-isolation.md`](docs/workspace-isolation.md) |
| Security model | [`docs/security-model.md`](docs/security-model.md) |
| Operations runbook | [`docs/operations.md`](docs/operations.md) |
| Video script / voiceover | [`docs/video-script.md`](docs/video-script.md), [`docs/video-voiceover-115s.md`](docs/video-voiceover-115s.md) |
| KeeperHub bounty feedback | [`KEEPERHUB_FEEDBACK.md`](KEEPERHUB_FEEDBACK.md) |

---

## Repository layout

| Path | Role |
| --- | --- |
| [`contracts/`](contracts/) | Onchain `PolicyRegistry`, optional `ExecutionAnchor`, OpenZeppelin access patterns. |
| [`dsl/`](dsl/) | Policy schema, validation, sample policies. |
| [`policy-engine/`](policy-engine/) | Deterministic compiler and evaluator; storage adapter boundary. |
| [`agent-sdk/`](agent-sdk/) | `PolicyClient`, adapters (ENS, 0G, KeeperHub), swarm example entrypoints. |
| [`keeperhub-workflows/`](keeperhub-workflows/) | Workflow routing, execution, reconciliation, analytics-shaped outputs. |
| [`ens-identity/`](ens-identity/) | ENS metadata and role/subname helper scripts. |
| [`indexer/`](indexer/) | Indexed state and compliance API scaffold. |
| [`api/`](api/) | Vercel Functions: `/api/ops/*` trust envelopes, `/api/functions/debate-policy`. |
| [`web/`](web/) | Vite + React 18 operator console, policy builder, trust UI. |
| [`scripts/`](scripts/) | Preflight, validation, demos, deployment helpers. |
| [`test/`](test/) | Unit, integration, submission trust tests. |
| [`examples/`](examples/) | Reference scenarios and templates. |

---

## Documentation

The **documentation hub** is [`docs/README.md`](docs/README.md): curated reading orders (new contributor, operator, judge, extension author), the full index, and maintenance rules.

---

## Sponsor alignment

- **0G (framework, agents, storage, compute, chain):** adapter-based surfaces with deterministic fallbacks and optional live SDK paths.
- **ENS (identity + creative use):** passports, roles, authorization, reverse verification, execution-profile routing.
- **KeeperHub (execution + reliability):** policy-derived branches, retries, run logs, reconciliation, analytics.

Full traceability to files and judging criteria: **[`docs/sponsor-mapping.md`](docs/sponsor-mapping.md)**.

---

## Environment boundaries

- **Root** [`.env.example`](.env.example): server, chain, ENS, KeeperHub, 0G, and agent signer variables.
- **`web/.env.example`:** browser boundary: only **`VITE_*`** keys ship to the client bundle.

**Never** put secrets, private keys, API keys, JWTs, or server-only endpoints in `VITE_*`. Env contract validation is part of `npm run validate:env` and the judge preflight.

---

## Contributing

See **[`CONTRIBUTING.md`](CONTRIBUTING.md)** for development setup, fail-closed expectations, adapter extension rules, RFC location (`docs/rfcs/`), and PR verification (`npm run verify`).

---

*gctl: policy first, identity verified, execution observable.*
