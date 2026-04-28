# Submission Pack

This file centralizes final assets required for ETHGlobal submissions.

## Status
- [ ] Links finalized and public
- [x] Demo evidence artifacts captured
- [ ] Contacts filled
- [ ] Submission form ready

## Required links to fill

- GitHub repo: `https://github.com/gdev27/gctl`
- Live demo: `Local CLI demo (outputs captured in docs/evidence/)`
- Demo video (<3 min): `TBD - recording pending upload`
- Team contacts (Telegram + X): `TBD by builder`
- Submission form URL (draft/final): `TBD`

## Build and verification commands

```bash
npm install
npm run hh:compile
npm run test
npm run typecheck
npm run demo:deterministic
npm run demo:swarm
npm run ens:passport
```

## Evidence artifacts

- Architecture diagram: `docs/architecture.md`
- Sponsor mapping: `docs/sponsor-mapping.md`
- Deployment addresses: `docs/deployments.md`
- Demo script: `docs/video-script.md`
- Submission copy draft: `docs/submission-draft.md`
- Final checklist: `docs/submission-checklist.md`
- KeeperHub feedback bounty report: `KEEPERHUB_FEEDBACK.md`

## Runtime + deployment evidence (paste links/paths)
- Policy registry address + tx: `0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814` + `https://sepolia.basescan.org/tx/0x5c431661680dbf7c3ae26a3b5c88b8b5bb3570a0bdd333257fa712669c5bc540`
- 0G attestation evidence: `n/a in current run (simulated chain adapter path)`
- ENS passport output: `docs/evidence/ens-passport.txt`
- KeeperHub execution evidence: `not reached in deterministic run due fail-closed ENS policy metadata gate`

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
- Video file/source: `TBD`

