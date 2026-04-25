# Institutional Policy OS

Institutional Policy OS is a hackathon-ready TypeScript + Hardhat project for policy-constrained autonomous execution.

Built by Gaurav Dev.

## Track strategy
- Primary target: KeeperHub - Best Use of KeeperHub.
- Secondary target: ENS - Best ENS Integration for AI Agents.
- Scope freeze and backlog are documented in `docs/win-scope.md`.

## Why this can win
- Triple-verified architecture:
  - Intent verification through signed intent proof checks.
  - Process integrity through deterministic policy evaluation + decision trace.
  - Outcome anchoring through on-chain policy hash checks + reconciled audit artifacts.
- Real agentic behavior: identical agent code branches into different execution workflows based on policy + amount.
- Infrastructure depth over hype: fail-closed planning, reconciliation, and auditable terminal states.

## What the demo proves
- YAML policy DSL with schema validation and version gate.
- Deterministic policy graph hashing and on-chain anchoring in `PolicyRegistry`.
- ENS-based policy discovery and agent authorization.
- KeeperHub workflow mapping for small (`batch-auction`) vs large (`direct-swap`) paths.
- Reconciliation terminal states with redacted/encrypted audit payloads.

## Setup
```bash
npm install
cp .env.example .env
```

## Core commands
```bash
npm run hh:compile
npm run hh:test
npm run test
npm run compile:policy
npm run demo:init
npm run demo:deterministic
```

## Demo flow
1. Deploy `PolicyRegistry`:
   ```bash
   npx hardhat run scripts/deployPolicyRegistry.ts --network baseSepolia
   ```
2. Set `POLICY_REGISTRY_ADDRESS` in `.env`.
3. Compile and register policy:
   ```bash
   npm run compile:policy
   ```
4. Set ENS text records:
   ```bash
   npx tsx ens-identity/scripts/setEnsRecords.ts
   ```
5. Run deterministic dual-branch demo:
   ```bash
   npm run demo:deterministic
   ```

## Submission assets
- Sponsor mapping: `docs/sponsor-mapping.md`
- Architecture: `docs/architecture.md`
- Triple-verified details: `docs/triple-verified.md`
- Demo walkthrough: `docs/demo-flows.md`
- Security model: `docs/security-model.md`
- Operations runbook: `docs/operations.md`
- Final checklist: `docs/submission-checklist.md`
- Video script and recording plan: `docs/video-script.md`

## Project structure
- `contracts/`: on-chain policy registry with RBAC + guardian pause.
- `dsl/`: policy schema, validation, and sample policies.
- `policy-engine/`: compiler, deterministic evaluator, storage adapters.
- `agent-sdk/`: ENS resolution, hash verification, fail-closed planning.
- `keeperhub-workflows/`: workflow mapping, KeeperHub clients, reconciliation.
- `ens-identity/`: ENS metadata configuration scripts.
- `indexer/`: lightweight indexed state and compliance API scaffold.
- `scripts/`: deploy + init + deterministic demo scripts.
- `test/`: fail-closed, reconciliation, privacy, and critical-claims tests.
