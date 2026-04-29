# Submission Pack

This file centralizes final assets required for ETHGlobal submissions.

## Status
- [ ] Links finalized and public
- [x] Demo evidence artifacts captured
- [x] Contacts filled
- [ ] Submission form ready

## Required links to fill

- GitHub repo: `https://github.com/gdev27/gctl`
- Live demo: `Local CLI demo (outputs captured in docs/evidence/)`
- Demo video (<3 min): `TBD - recording pending upload`
- Team contacts (Telegram + X): `Telegram @gdev27, X https://x.com/gdev27`
- Submission form URL (draft/final): `TBD`

## Build and verification commands

```bash
npm install
npm run judge:preflight
```

## Evidence artifacts

- Architecture diagram: `docs/architecture.md`
- Sponsor mapping: `docs/sponsor-mapping.md`
- Deployment addresses: `docs/deployments.md`
- Demo script: `docs/video-script.md`
- Submission copy draft: `docs/submission-draft.md`
- Final checklist: `docs/submission-checklist.md`
- Trust invariants: `docs/trust-invariants.md`
- KeeperHub feedback bounty report: `KEEPERHUB_FEEDBACK.md`

## Trust claim to proof matrix
- `INV-FAILCLOSED-001` (dependency fail-closed):
  - tests: `test/policyClient.failClosed.test.ts`
  - evidence: `docs/evidence/demo-deterministic.json`
- `INV-POLICYHASH-001` (policy integrity):
  - tests: `test/policyClient.failClosed.test.ts`
  - evidence: `docs/evidence/demo-deterministic.json`
- `INV-ENS-001` (ENS reverse verification):
  - tests: `test/ensIdentityPassport.test.ts`
  - evidence: `docs/evidence/ens-passport.txt`
- `INV-ENS-002` (ENS role/subname metadata):
  - tests: `test/submissionTrustClaims.test.ts`
  - evidence: `docs/evidence/trust-evidence.json` (`ens.roleIdentities`)
- `INV-NOHARDCODE-001` (no hardcoded trust identities):
  - tests: `test/submissionTrustClaims.test.ts`
  - gates: `npm run validate:env`
- `INV-WORKFLOW-001`, `INV-WORKFLOW-002` (workflow branching + traceability):
  - tests: `test/workflowBranching.test.ts`, `test/submissionTrustClaims.test.ts`
  - evidence: `docs/evidence/trust-evidence.json` (`workflows`)
- `INV-ATTEST-001` (attestation mapping):
  - schema gate: `npm run validate:evidence`
  - evidence: `docs/evidence/trust-evidence.json` (`attestation`)
- `INV-SOURCE-001` (source/trust envelope in ops APIs):
  - tests: `apps/web/lib/status.test.ts`
  - implementation: `apps/web/app/api/ops/_lib/data.ts`

## Runtime + deployment evidence (paste links/paths)
- Policy registry address + tx: `0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814` + `https://sepolia.basescan.org/tx/0x5c431661680dbf7c3ae26a3b5c88b8b5bb3570a0bdd333257fa712669c5bc540`
- 0G attestation evidence: `n/a in current run (simulated chain adapter path)`
- ENS passport output: `docs/evidence/ens-passport.txt`
- KeeperHub execution evidence: `not reached in deterministic run due fail-closed ENS metadata gate (missing ENS text record: policy-id)`
- Preflight report (markdown): `docs/evidence/judge-preflight-report.md`
- Preflight report (json): `docs/evidence/judge-preflight-report.json`
- Preflight command outputs: `docs/evidence/preflight/*.txt`
- Structured trust evidence: `docs/evidence/trust-evidence.json`

## Current blockers (before final submit)
- `npm run compile:policy` and `npm run demo:init`: revert with `policy_exists` on current `PolicyRegistry`.
- Deterministic + swarm execution branch remains fail-closed until ENS text record `policy-id` is configured.
- `npx tsx ens-identity/scripts/setEnsRecords.ts`: fails in current environment because ENS env values are missing (`ENS_MAINNET_RPC_URL` or `MAINNET_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `FUND_ENS_RESOLVER_ADDRESS`, `AGENT_ENS_RESOLVER_ADDRESS`).

## Demo outputs to capture

- Deterministic flow:
  - `plan.pathType`, `plan.route`, `workflowId`, `runId`, `reconciliationState`
  - `computePreflight`, `memoryArtifacts`, `chainAttestation`
- Swarm flow:
  - `passport`, `traces.planner`, `traces.researcher`, `traces.critic`
  - final `execution` object

## Final artifact pointers (fill before submit)
- Safe-path JSON: `docs/evidence/demo-deterministic.json`
- Escalated-path JSON: `docs/evidence/demo-deterministic.json`
- Blocked-path JSON: `docs/evidence/demo-deterministic.json`
- Swarm run JSON: `docs/evidence/demo-swarm.json`
- Structured trust evidence JSON: `docs/evidence/trust-evidence.json`
- Trust evidence schema JSON: `docs/evidence/schema/trust-evidence.schema.json`
- Judge preflight summary: `docs/evidence/judge-preflight-report.md`
- Judge preflight machine report: `docs/evidence/judge-preflight-report.json`
- Judge preflight raw command logs: `docs/evidence/preflight/*.txt`
- Video file/source: `TBD`

