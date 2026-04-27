# Submission Pack

This file centralizes final assets required for ETHGlobal submissions.

## Required links to fill

- GitHub repo: `<PUBLIC_GITHUB_URL>`
- Live demo: `<LIVE_DEMO_URL_OR_NA>`
- Demo video (<3 min): `<VIDEO_URL>`
- Team contacts (Telegram + X): `<TEAM_CONTACTS>`

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

## Demo outputs to capture

- Deterministic flow:
  - `plan.pathType`, `plan.route`, `workflowId`, `runId`, `reconciliationState`
  - `computePreflight`, `memoryArtifacts`, `chainAttestation`
- Swarm flow:
  - `passport`, `traces.planner`, `traces.researcher`, `traces.critic`
  - final `execution` object

