# ETHGlobal Submission Draft

## Project name
gctl

## One-line description
gctl is an open-source agent framework and autonomous swarm reference app that makes onchain execution trustworthy through policy constraints, verifiable identity, and reliability-first execution.

## What we built
gctl includes:
- Framework-level `PolicyGraph SDK` with stable adapters for identity, compute/memory, and execution.
- ENS identity passports with role metadata, authorization checks, and reverse-resolution verification enforced on caller-driven execution.
- 0G-backed preflight inference and ciphertext-at-rest memory artifacts with explicit simulated/onchain chain attestation receipts.
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

## Trust claim to proof map
- **Fail-closed dependency behavior (`INV-FAILCLOSED-001`):**
  - Evidence: `docs/evidence/demo-deterministic.json`
  - Test gate: `test/policyClient.failClosed.test.ts`
  - Preflight step: `test` in `docs/evidence/judge-preflight-report.md`
- **Policy integrity and deterministic evaluation (`INV-POLICYHASH-001`):**
  - Evidence: deterministic traces in `docs/evidence/demo-deterministic.json`
  - Test gate: `test/policyClient.failClosed.test.ts`
  - Preflight steps: `hh-compile`, `test`, `typecheck`
- **ENS identity and reverse verification (`INV-ENS-001`):**
  - Evidence: `docs/evidence/ens-passport.txt`
  - Test gate: `test/ensIdentityPassport.test.ts`, `test/policyClient.failClosed.test.ts`
  - Preflight step: `ens-passport`
- **ENS role/subname metadata visibility (`INV-ENS-002`):**
  - Evidence: `docs/evidence/trust-evidence.json` (`ens.roleIdentities`)
  - Test gate: `test/submissionTrustClaims.test.ts`
  - Preflight step: `test`
- **No hardcoded demo trust identities (`INV-NOHARDCODE-001`):**
  - Evidence: env-driven demo scripts, `.env.example`, and `web/.env.example`
  - Test gate: `test/submissionTrustClaims.test.ts`
  - Preflight step: `validate-env`
- **KeeperHub workflow branch and traceability (`INV-WORKFLOW-001`, `INV-WORKFLOW-002`):**
  - Evidence: `docs/evidence/trust-evidence.json` (`workflows[*]`), `docs/evidence/demo-deterministic.json`
  - Test gate: `test/workflowBranching.test.ts`, `test/submissionTrustClaims.test.ts`
  - Preflight step: `test`
- **0G attestation mapping (`INV-ATTEST-001`):**
  - Evidence: `docs/evidence/trust-evidence.json` (`attestation`)
  - Schema gate: `docs/evidence/schema/trust-evidence.schema.json`
  - Preflight step: `validate-evidence`
- **API fallback/source disclosure (`INV-SOURCE-001`):**
  - Evidence: Ops API trust envelope in `api/ops/*` and `api/_lib/data.js`
  - Test gate: `test/submissionTrustClaims.test.ts`, `web/src/api/gctlClient.js`, `web/src/hooks/useOpsEnvelope.js`
  - Preflight steps: `web:lint`, `web:typecheck`, `web:build`

## 0G tracks
- Framework track: adapter-based framework and extension surfaces.
- Autonomous track: role-based swarm with persistent memory and policy-constrained execution.
- Protocol features used:
  - 0G Compute adapter for planner/critic reasoning preflight,
  - 0G Storage memory adapter for encrypted-at-rest swarm and execution artifacts with local deterministic fallback and optional runtime SDK-backed remote upload/download (SDK not a root dependency: `docs/zerog-storage-sdk-peer.md`, operator env: `docs/zerog-storage-operators.md`),
  - 0G chain attestation adapter for proof anchoring, explicitly tagged as `simulated` or `onchain` in evidence.

## ENS track
ENS is non-cosmetic and runtime-critical:
- role identity passports with metadata and reverse verification,
- policy discovery and authorization records,
- execution profile metadata influences routing behavior,
- ENS role subnames support discoverability and accountable multi-agent coordination.

Caller authorization is based on the configured ENS text record key (`agent-registration[<registry-segment>][agentId]`). A live ERC-8004 registry can be supplied, but the current deterministic judging path treats the ENS registration record itself as the authorization source.

## KeeperHub track
KeeperHub is the execution/reliability layer:
- policy-to-workflow branching (`safe-path`, `escalated-path`),
- execution status polling and terminal state normalization,
- encrypted audit artifacts and analytics output in demo responses.

## Repository
https://github.com/gdev27/gctl

## Live demo
- Web demo: `https://gctl.vercel.app`
- Repeatable technical demo: `npm run judge:preflight` with artifacts in `docs/evidence/`

## Frontend demo surface
- `web/` ships at https://gctl.vercel.app with the operator console: dashboard, agents, policy builder (with AI debate template generator), playground, swarm, alerting, explorer, team, and onboarding readiness.
- Vercel Functions in `api/ops/*` bridge indexer payloads through a trust-enveloped (`source`/`trustStatus`/`reasonCode`/`recoveryAction`) contract; the SPA renders a `SourceBadge` and `FallbackBanner` whenever `trustStatus !== healthy`.
- `api/functions/debate-policy.js` runs a Proposer → Critic → Synthesizer chain on `OPENAI_API_KEY` and falls back to a deterministic synthesizer otherwise.

## Demo video (under 3 minutes)
`Pending external upload; paste the final public URL into docs/submission-pack.md before submit.`

## Contract deployment addresses
- PolicyRegistry (Base Sepolia): `0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814`
- 0G attestation target (0G testnet): n/a in the current deterministic run. `ZEROG_ATTESTATION_MODE=onchain` enables a deployed `ExecutionAnchor`.
- Optional ERC-8004 registry: `n/a`

## Protocol features/SDKs used
- 0G compute/storage/chain adapter pattern with optional official 0G storage SDK hooks
- ENS resolver + identity passport metadata
- KeeperHub workflows, logs, analytics, and reconciliation
- EVM smart contract anchoring (`PolicyRegistry`)

## Builder and contact
- Gaurav Dev
- GitHub: `https://github.com/gdev27`
- Telegram: `@gdev27`
- X: `https://x.com/gdev27`

## Setup commands for judges
```bash
npm install
npm run judge:preflight
```

## Notes for judges
- If RPC or partner credentials are missing, the system fails closed and returns explicit dependency error codes by design.
- Deterministic fallback mode is available for reproducible judging flow when live endpoints are unstable.
- Trust invariants are formally defined in `docs/trust-invariants.md`; each claim above maps to those invariant IDs.
- End-to-end gate status is generated by `npm run judge:preflight` and recorded in `docs/evidence/judge-preflight-report.md` and `docs/evidence/judge-preflight-report.json`.

## Final evidence paste block
- Invariant catalog: `docs/trust-invariants.md`
- Preflight summary report: `docs/evidence/judge-preflight-report.md`
- Preflight machine report: `docs/evidence/judge-preflight-report.json`
- Per-step command outputs: `docs/evidence/preflight/*.txt`
- Deterministic demo artifact: `docs/evidence/demo-deterministic.json`
- Swarm demo artifact: `docs/evidence/demo-swarm.json`
- ENS passport artifact: `docs/evidence/ens-passport.txt`
- Structured trust evidence artifact: `docs/evidence/trust-evidence.json`
- Trust evidence schema: `docs/evidence/schema/trust-evidence.schema.json`
