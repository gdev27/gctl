# gctl documentation

Welcome. This folder is the **authoritative narrative** for architecture, trust, operations, frontend contracts, and submission evidence. The root [`README.md`](../README.md) is the front door; **this file is the map**.

---

## How this documentation is organized

We split content into **three lanes** so you rarely have to guess where a fact lives:

| Lane | Intent | Typical reader |
| --- | --- | --- |
| **Build truth** | What the system is, how components connect, what invariants hold | Engineers, auditors, judges |
| **Run truth** | How to configure, deploy, validate, and recover | Operators, SRE, integration |
| **Ship truth** | Checklists, sponsor mapping, video scripts, evidence paths | Hackathon submitters, PMs, reviewers |

If you change behavior, contracts, or env semantics, update the **build** doc first, then **run**, then **ship** artifacts that reference invariant IDs or commands.

---

## Suggested reading orders

### I just cloned the repo

1. [`../README.md`](../README.md) — quickstart and repo layout  
2. [`architecture.md`](./architecture.md) — one diagram, trust boundaries  
3. [`trust-invariants.md`](./trust-invariants.md) — non-negotiable guarantees (`INV-*`)  
4. [`CONTRIBUTING.md`](../CONTRIBUTING.md) — workflow and adapter rules  

### I am operating or integrating gctl

1. [`operations.md`](./operations.md) — day-one path, env contracts, pause/rotate, preflight  
2. [`deployments.md`](./deployments.md) — networks, contract addresses, explorer links  
3. [`security-model.md`](./security-model.md) — threat overview, roles, pause semantics, audit privacy  
4. [`frontend-product-contract.md`](./frontend-product-contract.md) — ops UI trust envelope  

### I am reviewing or judging a submission

1. [`submission-pack.md`](./submission-pack.md) — links, command matrix, status  
2. [`trust-invariants.md`](./trust-invariants.md) — invariant → proof mapping  
3. [`evidence/trust-evidence.json`](./evidence/trust-evidence.json) — structured claims  
4. [`evidence/judge-preflight-report.md`](./evidence/judge-preflight-report.md) — last preflight narrative  
5. [`sponsor-mapping.md`](./sponsor-mapping.md) — sponsor feature ↔ code paths  

### I am extending adapters or policy

1. [`adapter-contracts.md`](./adapter-contracts.md) — stable surfaces  
2. [`extension-cookbook.md`](./extension-cookbook.md) — patterns and pitfalls  
3. [`policy-dsl.md`](./policy-dsl.md) — schema and authoring  
4. [`rfcs/`](./rfcs/) — propose breaking or semantic changes first  

### I am building or reviewing the web app

1. [`frontend-product-contract.md`](./frontend-product-contract.md) — trust UX rules  
2. [`frontend-ops-ui.md`](./frontend-ops-ui.md) — ops surfaces  
3. [`frontend-copy-style-guide.md`](./frontend-copy-style-guide.md) — voice and labels  

---

## Index: build truth

| Document | What you will find |
| --- | --- |
| [`architecture.md`](./architecture.md) | Mermaid system diagram; trust boundaries (ENS, registry, 0G, KeeperHub, fail-closed client); ops/API notes |
| [`trust-invariants.md`](./trust-invariants.md) | Canonical `INV-*` list: guarantees, failure behavior, proof paths (tests + evidence) |
| [`adapter-contracts.md`](./adapter-contracts.md) | Adapter stability expectations and extension hooks |
| [`policy-dsl.md`](./policy-dsl.md) | Policy language, validation, examples |
| [`security-model.md`](./security-model.md) | Threat overview ↔ mitigations ↔ `INV-*`, contract roles, fail-closed planning, keys, policy hash integrity, audit field classification |
| [`versioning-policy.md`](./versioning-policy.md) | Version and compatibility notes |
| [`triple-verified.md`](./triple-verified.md) | Cross-check narrative where applicable |

---

## Index: run truth

| Document | What you will find |
| --- | --- |
| [`operations.md`](./operations.md) | Day-one clone→green steps, emergency pause, key rotation, reconciliation, env validation, preflight command matrix |
| [`deployments.md`](./deployments.md) | Chain IDs, deployed addresses, txs, `.env` mappings, policy URI guidance |
| [`workspace-isolation.md`](./workspace-isolation.md) | Isolating workspaces and dependency trees |
| [`zerog-storage-sdk-peer.md`](./zerog-storage-sdk-peer.md) | Why 0G storage SDK is optional at root; `ethers` peer interaction with Hardhat |
| [`zerog-storage-operators.md`](./zerog-storage-operators.md) | Operator install patterns and CI smoke references |

---

## Index: ship truth (submissions and narrative)

| Document | What you will find |
| --- | --- |
| [`submission-pack.md`](./submission-pack.md) | Central submission hub: commands, evidence list, trust matrix |
| [`submission-checklist.md`](./submission-checklist.md) | Final human checklist |
| [`submission-draft.md`](./submission-draft.md) | Long-form submission copy draft |
| [`sponsor-mapping.md`](./sponsor-mapping.md) | 0G, ENS, KeeperHub ↔ implementation paths and judging angles |
| [`video-script.md`](./video-script.md) | Demo video structure |
| [`video-voiceover-115s.md`](./video-voiceover-115s.md) | Timed voiceover script |

---

## Index: frontend and product

| Document | What you will find |
| --- | --- |
| [`frontend-product-contract.md`](./frontend-product-contract.md) | `source`, `trustStatus`, banners—no silent mixing of live and fallback |
| [`frontend-ops-ui.md`](./frontend-ops-ui.md) | Operator dashboard semantics |
| [`frontend-copy-style-guide.md`](./frontend-copy-style-guide.md) | Copy and tone for trust-sensitive UI |

---

## Evidence directory

[`evidence/`](./evidence/) holds **captured outputs**: demo JSON, ENS passport text, preflight transcripts, schema for `trust-evidence.json`, and judge reports.

- Treat most files as **reproducible artifacts** tied to `npm run judge:preflight` and demo scripts—not hand-edited lore.  
- Schema gate: `npm run validate:evidence`  

---

## RFCs

[`rfcs/`](./rfcs/) is for design proposals that should be discussed before code lands: adapter surface changes, DSL evolution, security model shifts, execution semantics. See also [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Upstream notes

[`upstream/`](./upstream/) may contain drafts for external issues (e.g. ecosystem SDK peers). Not runtime documentation.

---

## Maintenance rules

1. **Do not** commit ephemeral runtime dirs (`cache/`, `.zerog-memory/`, `reconciliation-logs/`)—see contributing guide.  
2. **Do** update root [`README.md`](../README.md) and [`CONTRIBUTING.md`](../CONTRIBUTING.md) when user-facing commands or env keys change.  
3. **Prefer** editing an existing doc over adding a near-duplicate; link out from [`submission-pack.md`](./submission-pack.md) as the single submission hub.  
4. **Any** weakening of a trust invariant requires updating [`trust-invariants.md`](./trust-invariants.md), linked tests, evidence schema if applicable, and submission docs that cite the `INV-*` id.

---

*When in doubt: read the invariants, run the preflight, then open the evidence folder.*
