# Submission Pack

This file centralizes final assets required for ETHGlobal submissions.

## Status
- [ ] External links finalized and public
- [x] Demo evidence artifacts captured
- [x] Contacts filled
- [ ] Submission form URL pasted after final ETHGlobal draft is created

## Required links

- GitHub repo: `https://github.com/gdev27/gctl`
- Live web demo: `https://gctl.vercel.app`
- Primary technical demo: `npm run judge:preflight` with outputs captured in `docs/evidence/`
- Demo video (<3 min): `Pending external upload; paste final URL here before submit`
- Team contacts (Telegram + X): `Telegram @gdev27, X https://x.com/gdev27`
- Submission form URL (draft/final): `Pending ETHGlobal form URL; paste final URL here before submit`

## Build and verification commands

```bash
npm install
npm ci --prefix web
npm run judge:preflight
npm run web:lint
npm run web:typecheck
npm run web:build
```

## Evidence artifacts

- Architecture diagram: `docs/architecture.md`
- Sponsor mapping: `docs/sponsor-mapping.md`
- Deployment addresses: `docs/deployments.md`
- Demo script: `docs/video-script.md`
- 115-second voiceover: `docs/video-voiceover-115s.md`
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
  - evidence: `docs/evidence/demo-deterministic.json`, `docs/security-model.md`
- `INV-ENS-001` (ENS reverse verification):
  - tests: `test/ensIdentityPassport.test.ts`
  - evidence: `docs/evidence/ens-passport.txt`
- `INV-ENS-002` (ENS role/subname metadata):
  - tests: `test/submissionTrustClaims.test.ts`
  - evidence: `docs/evidence/trust-evidence.json` (`ens.roleIdentities`)
- `INV-NOHARDCODE-001` (no hardcoded trust identities):
  - tests: `test/submissionTrustClaims.test.ts`
  - evidence: `.env.example`, `web/.env.example`
  - gates: `npm run validate:env`
- `INV-WORKFLOW-001`, `INV-WORKFLOW-002` (workflow branching + traceability):
  - tests: `test/workflowBranching.test.ts`, `test/submissionTrustClaims.test.ts`
  - evidence: `docs/evidence/trust-evidence.json` (`workflows`)
- `INV-ATTEST-001` (attestation mapping):
  - schema gate: `npm run validate:evidence`
  - evidence: `docs/evidence/trust-evidence.json` (`attestation`)
- `INV-SOURCE-001` (source/trust envelope in ops APIs):
  - tests: `test/submissionTrustClaims.test.ts` (asserts `api/_lib/data.js` envelope shape + no hardcoded demo identities)
  - implementation: `api/_lib/data.js`, `api/ops/*.js`, consumed by `web/src/api/gctlClient.js` and `web/src/hooks/useOpsEnvelope.js`

## Runtime + deployment evidence (paste links/paths)
- Policy registry address + tx: `0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814` + `https://sepolia.basescan.org/tx/0x5c431661680dbf7c3ae26a3b5c88b8b5bb3570a0bdd333257fa712669c5bc540`
- 0G attestation evidence: `docs/evidence/trust-evidence.json` (`attestation`, `kind=simulated` in the deterministic judging run; `kind=onchain` requires `ZEROG_ATTESTATION_MODE=onchain` and a deployed `ExecutionAnchor`)
- 0G official storage SDK vs Hardhat `ethers` peers (optional runtime import): `docs/zerog-storage-sdk-peer.md`, `docs/zerog-storage-operators.md`, CI smoke: `.github/workflows/zerog-storage-sdk-smoke.yml`
- ENS passport output: `docs/evidence/ens-passport.txt`
- KeeperHub execution evidence: `demo runs now produce workflowId/runId and succeeded reconciliation states (see docs/evidence/demo-deterministic.json and docs/evidence/demo-swarm.json)`
- Preflight report (markdown): `docs/evidence/judge-preflight-report.md`
- Preflight report (json): `docs/evidence/judge-preflight-report.json`
- Preflight command outputs: `docs/evidence/preflight/*.txt`
- Structured trust evidence: `docs/evidence/trust-evidence.json`

## Remaining manual submission actions
- Upload final demo video and paste the public URL above.
- Create or finalize the ETHGlobal submission form and paste the URL above.
- Rerun `npm run judge:preflight` and frontend gates immediately before submitting, then refresh `docs/evidence/judge-preflight-report.md`.
- If `npm run compile:policy` or `npm run demo:init` is run against the existing deployed `PolicyRegistry`, an idempotency guard may return `policy_exists`; use `npm run demo:deterministic` and `npm run judge:preflight` as the repeatable judge path unless deploying a fresh registry.

## Demo outputs to capture

- Deterministic flow:
  - `plan.pathType`, `plan.route`, `workflowId`, `runId`, `reconciliationState`
  - `computePreflight`, `memoryArtifacts`, `chainAttestation`
  - `trustFootprint` (`ens`, `compute`, `memory`, `attestation` when execution reaches anchoring)
- Swarm flow:
  - `passport`, `traces.planner`, `traces.researcher`, `traces.critic`
  - final `execution` object
  - `trustFootprint` (`ens`, `compute`, `memory`)

## Final artifact pointers (fill before submit)
- Deterministic safe/escalated/blocked branches: `docs/evidence/demo-deterministic.json` (single consolidated artifact)
- Swarm run JSON: `docs/evidence/demo-swarm.json`
- Structured trust evidence JSON: `docs/evidence/trust-evidence.json`
- Trust evidence schema JSON: `docs/evidence/schema/trust-evidence.schema.json`
- Judge preflight summary: `docs/evidence/judge-preflight-report.md`
- Judge preflight machine report: `docs/evidence/judge-preflight-report.json`
- Judge preflight raw command logs: `docs/evidence/preflight/*.txt`
- Video file/source: `Pending external upload; paste final URL before submit`

