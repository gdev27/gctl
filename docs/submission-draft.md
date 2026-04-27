# ETHGlobal Submission Draft

## Project name
Institutional Policy OS v2: Agent Reliability Fabric

## One-line description
Institutional Policy OS v2 is an open-source agent framework and autonomous swarm reference app that makes onchain execution trustworthy through policy constraints, verifiable identity, and reliability-first execution.

## What we built
Institutional Policy OS v2 includes:
- Framework-level `PolicyGraph SDK` with stable adapters for identity, compute/memory, and execution.
- ENS identity passports with role metadata, authorization checks, and reverse-resolution verification.
- 0G-backed preflight inference and encrypted memory artifacts with chain attestation receipts.
- KeeperHub execution routing into safe and escalated paths, with reconciliation logs and analytics.
- A four-role autonomous swarm (planner, researcher, critic, executor) sharing persistent memory.

## Agentic behavior
The same objective is handled by a role-specialized swarm:
- `planner` proposes a policy-aware action,
- `researcher` enriches context,
- `critic` challenges risk and can veto unsafe plans,
- `executor` only runs approved actions through reliability-gated workflows.

This creates autonomous behavior with governance boundaries, rather than static automation.

## Verification model
- Intent verification: signed intent proof validation in planning path.
- Process integrity: deterministic policy compiler/engine and reproducible decision traces.
- Outcome anchoring: execution artifacts and attestation metadata linked to chain and audit outputs.

## 0G tracks
- Framework track: adapter-based framework and extension surfaces.
- Autonomous track: role-based swarm with persistent memory and policy-constrained execution.
- Protocol features used:
  - 0G Compute adapter for planner/critic reasoning preflight,
  - 0G Storage memory adapter for encrypted swarm and execution artifacts,
  - 0G chain attestation adapter for proof anchoring.

## ENS track
ENS is non-cosmetic and runtime-critical:
- role identity passports with metadata and reverse verification,
- policy discovery and authorization records,
- execution profile metadata influences routing behavior.
- ENS role subnames support discoverability and accountable multi-agent coordination.

## KeeperHub track
KeeperHub is the execution/reliability layer:
- policy-to-workflow branching (`safe-path`, `escalated-path`),
- execution status polling and terminal state normalization,
- encrypted audit artifacts and analytics output in demo responses.

## Repository
<PUBLIC_GITHUB_URL>

## Live demo
<LIVE_DEMO_URL_OR_NA>

## Demo video (under 3 minutes)
<VIDEO_URL>

## Contract deployment addresses
- PolicyRegistry (Base Sepolia): `pending`
- 0G attestation target (0G testnet): `pending`
- Optional ERC-8004 registry: `n/a`

## Protocol features/SDKs used
- 0G compute/storage/chain adapter pattern
- ENS resolver + identity passport metadata
- KeeperHub workflows, logs, analytics, and reconciliation
- EVM smart contract anchoring (`PolicyRegistry`)

## Builder and contact
- Gaurav Dev
- Telegram: `<TELEGRAM_HANDLE>`
- X: `<X_HANDLE>`

## Setup commands for judges
```bash
npm install
npm run hh:compile
npm run test
npm run typecheck
npm run demo:deterministic
npm run demo:swarm
npm run ens:passport
```

## Notes for judges
- If RPC or partner credentials are missing, the system fails closed and returns explicit dependency error codes by design.
- Deterministic fallback mode is available for reproducible judging flow when live endpoints are unstable.
