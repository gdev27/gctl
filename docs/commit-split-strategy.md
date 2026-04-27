# Commit Split Strategy

Use this split to keep the PR easy to review and merge-ready.

## Commit 1: Framework Core + Integrations

**Message suggestion**
`feat: add adapter-driven agent reliability core with 0g, ens, and keeperhub hooks`

**Include**
- Core adapter contracts and protocol implementations:
  - `agent-sdk/src/adapters.ts`
  - `agent-sdk/src/zeroG.ts`
  - `agent-sdk/src/client.ts`
  - `agent-sdk/src/ensResolver.ts`
  - `agent-sdk/src/types.ts`
- Execution reliability wiring:
  - `keeperhub-workflows/src/buildFromPlan.ts`
  - `keeperhub-workflows/src/client.ts`
  - `keeperhub-workflows/src/client.mock.ts`
  - `keeperhub-workflows/src/reconcile.ts`
  - `keeperhub-workflows/src/runDemo.ts`
- ENS role metadata pipeline:
  - `ens-identity/config/agents.json`
  - `ens-identity/scripts/setEnsRecords.ts`
  - `ens-identity/scripts/showIdentityPassport.ts`
- Runtime scripts/config:
  - `.env.example`
  - `package.json`

## Commit 2: Swarm + Tests + Reliability Validation

**Message suggestion**
`feat: add treasury twin swarm reference and deterministic reliability tests`

**Include**
- Swarm reference:
  - `agent-sdk/examples/treasuryTwinSwarm.ts`
- New/updated tests:
  - `test/zeroGAdapters.test.ts`
  - `test/ensIdentityPassport.test.ts`
  - `test/workflowBranching.test.ts`
  - `test/reconcile.test.ts`
  - `test/policyClient.failClosed.test.ts`
  - `test/integration/criticalClaims.spec.ts`

## Commit 3: Docs + Submission Package + OSS Productization

**Message suggestion**
`docs: package hackathon submission and open source contributor framework`

**Include**
- Core narrative/docs refresh:
  - `README.md`
  - `docs/win-scope.md`
  - `docs/architecture.md`
  - `docs/demo-flows.md`
  - `docs/sponsor-mapping.md`
  - `docs/deployments.md`
  - `docs/submission-checklist.md`
  - `docs/video-script.md`
  - `docs/submission-draft.md`
  - `docs/submission-pack.md`
- OSS governance docs:
  - `CONTRIBUTING.md`
  - `docs/adapter-contracts.md`
  - `docs/extension-cookbook.md`
  - `docs/versioning-policy.md`
  - `docs/rfcs/0001-adapter-stability.md`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `examples/README.md`
- Partner feedback artifact:
  - `KEEPERHUB_FEEDBACK.md`

## Recommended validation before each commit

```bash
npm run test
npm run typecheck
```

