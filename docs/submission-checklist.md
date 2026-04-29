# Submission Checklist

## Core Open Agents requirements
- [x] Project name + short description finalized.
- [x] Public GitHub repo link added.
- [x] README includes setup, architecture, and demo commands.
- [ ] Working technical demo completed with live credentials (`demo:deterministic`, `demo:swarm`, and `ens:passport`).
- [ ] Demo video is 2-3 minutes and shows agentic reasoning.
- [x] Team member names + contact links (Telegram + X) added.

## Mandatory evidence to include
- [x] Deployed contract addresses listed (`docs/deployments.md`).
- [x] Triple-verified explanation included (`docs/triple-verified.md`).
- [x] Demo output JSON captured for safe, escalated, and blocked paths.
- [x] Swarm execution output captured with role traces.

## 0G track checklist
- [x] Show 0G Compute usage in planner/critic loops.
- [x] Show 0G Storage memory artifacts in demo output.
- [ ] Show 0G Chain attestation evidence and tx hash mapping.
- [x] Include one framework example and one autonomous swarm example.

## ENS track checklist
- [x] Show ENS identity passport output (`npm run ens:passport`).
- [ ] Show role/subname identities and metadata fields.
- [x] Show authorization and reverse-verification in runtime flow.
- [ ] Confirm no hard-coded values in final demo path.

## KeeperHub track checklist
- [x] Explain KeeperHub usage and why it is integral (not optional).
- [ ] Show workflow submission, run status, logs, and analytics evidence.
- [x] Include encrypted audit artifact examples in repo or demo output.
- [x] Submit actionable integration feedback (`KEEPERHUB_FEEDBACK.md`).

## Final dry-run checklist (24h before deadline)
- [ ] Fresh clone setup test succeeds.
- [ ] `npm run judge:preflight` passes.
- [ ] `docs/evidence/judge-preflight-report.md` captured and reviewed.
- [ ] Video narration matches live outputs.
- [ ] Submission form links are valid and public.

## Automated trust gates
- [x] Trust invariants documented: `docs/trust-invariants.md`
- [x] Structured trust evidence exists: `docs/evidence/trust-evidence.json`
- [x] Evidence schema validation wired: `npm run validate:evidence`
- [x] Env contract validation wired: `npm run validate:env`
- [x] Submission trust claims covered by tests: `test/submissionTrustClaims.test.ts`

## Owner + evidence mapping (fill as completed)
- [x] Core demo owner: `Gaurav Dev`
- [x] ENS evidence owner: `Gaurav Dev`
- [x] 0G evidence owner: `Gaurav Dev`
- [x] KeeperHub evidence owner: `Gaurav Dev`
- [ ] Video owner: `Gaurav Dev`

## Verification snapshot (replace before submit)
- Date/time (UTC): `2026-04-29T11:04:48Z`
- Commit SHA: `290163f2aa5a857b9efb84b0eb278d3a51750c3b`
- Environment: `Windows 10 (local workspace)`
- `npm install`: `PASS`
- `npm run hh:compile`: `PASS`
- `npm run test`: `PASS`
- `npm run typecheck`: `PASS`
- `npm run compile:policy`: `FAIL (execution reverted: policy_exists on PolicyRegistry)`
- `npm run demo:init`: `FAIL (execution reverted: policy_exists on PolicyRegistry)`
- `npm run demo:deterministic`: `PASS (returns fail-closed dependency_failure due missing ENS text record: policy-id on vitalik.eth)`
- `npm run demo:swarm`: `PASS (produces passport + traces via simulated 0G compute; execution branch fails closed before KeeperHub due missing ENS text record: policy-id)`
- `npm run ens:passport`: `PASS (passport generated; authorized=false and metadata fields currently empty)`
