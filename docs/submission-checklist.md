# Submission Checklist

## Core Open Agents requirements
- [x] Project name + short description finalized.
- [x] Public GitHub repo link added.
- [x] README includes setup, architecture, and demo commands.
- [ ] Working technical demo completed with live credentials (`demo:deterministic`, `demo:swarm`, and `ens:passport`).
- [ ] Demo video is 2-3 minutes and shows agentic reasoning.
- [ ] Team member names + contact links (Telegram + X) added.

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
- [ ] `npm run hh:compile`, `npm run test`, `npm run typecheck`, `npm run demo:deterministic`, `npm run demo:swarm`, and `npm run ens:passport` pass.
- [ ] Video narration matches live outputs.
- [ ] Submission form links are valid and public.

## Owner + evidence mapping (fill as completed)
- [x] Core demo owner: `Gaurav Dev`
- [x] ENS evidence owner: `Gaurav Dev`
- [x] 0G evidence owner: `Gaurav Dev`
- [x] KeeperHub evidence owner: `Gaurav Dev`
- [ ] Video owner: `TBD`

## Verification snapshot (replace before submit)
- Date/time (UTC): `2026-04-28T19:34:12Z`
- Commit SHA: `f6bfc54cb21f009ca76200085883b81bff73b1d7`
- Environment: `Windows 10 (local workspace)`
- `npm install`: `PASS`
- `npm run hh:compile`: `PASS`
- `npm run test`: `PASS`
- `npm run typecheck`: `PASS`
- `npm run demo:deterministic`: `PASS (returns fail-closed dependency_failure due missing ENS text records on vitalik.eth)`
- `npm run demo:swarm`: `PASS (produces passport + traces; execution branch fails closed before keeperhub due ENS policy metadata dependency)`
- `npm run ens:passport`: `PASS`
