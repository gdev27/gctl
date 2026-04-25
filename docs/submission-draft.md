# ETHGlobal Submission Draft

## Project name
Institutional Policy OS

## One-line description
A fail-closed policy and execution layer for autonomous on-chain agents, with ENS identity resolution, deterministic policy reasoning, and KeeperHub-backed reliable execution reconciliation.

## What we built
Institutional Policy OS enforces policy-constrained autonomous execution for AI agents:
- Policy is authored in YAML, schema-validated, compiled deterministically, and hash-anchored on-chain.
- At runtime, the agent resolves policy and identity from ENS, verifies authorization, and evaluates policy deterministically.
- Execution plans are routed to KeeperHub workflows and reconciled to terminal states with privacy-preserving audit artifacts.
- The system is fail-closed: dependency failures never result in implicit execution.

## Agentic behavior
The same agent logic produces different execution plans based on policy + action context (small vs large trade), demonstrating autonomous decision branching rather than static automation.

## Triple-verified architecture
- Intent verification: signed intent proof validation in planning path.
- Process integrity: deterministic compiler + engine and reproducible decision traces.
- Outcome anchoring: on-chain policy hash verification plus reconciled workflow outcomes linked to audit artifacts.

## Primary track: KeeperHub Best Use
KeeperHub is integrated as a core execution layer:
- workflow construction from policy outcomes,
- execution/run handling via client abstraction,
- reconciliation into terminal states and indexed audit paths.

## Secondary track: ENS Best Integration
ENS is non-cosmetic and runtime-critical:
- policy discovery (`policy-id`, `policy-registry`, chain ID),
- agent authorization check via ENS records,
- `execution-profile` text record can modify runtime execution behavior.

## Repository
<PUBLIC_GITHUB_URL>

## Live demo
<LIVE_DEMO_URL_OR_NA>

## Demo video (under 3 minutes)
<VIDEO_URL>

## Contract deployment addresses
- PolicyRegistry (Base Sepolia): `pending`
- Optional ERC-8004 registry: `n/a`

## Protocol features/SDKs used
- KeeperHub workflows and reconciliation pattern
- ENS resolver-based metadata and authorization records
- EVM smart contract anchoring (`PolicyRegistry`)
- TypeScript/Hardhat policy and execution tooling

## Team members and contacts
- <NAME_1> — Telegram: <TG_1> — X: <X_1>
- <NAME_2> — Telegram: <TG_2> — X: <X_2>

## Setup commands for judges
```bash
npm install
npm run hh:compile
npm run test
npm run demo:deterministic
```

## Notes for judges
If network env variables are missing, the system demonstrates fail-closed behavior by denying execution with explicit dependency error codes, which is an intentional safety property.
