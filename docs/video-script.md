# 2-3 Minute Judging Video Script

## Target runtime
- 2 minutes 30 seconds total.

## Recording prep
1. Run:
   ```bash
   npm run demo:deterministic
   npm run demo:swarm
   ```
2. Keep terminal with resulting JSON output visible.
3. Open:
   - `docs/architecture.md`
   - `docs/sponsor-mapping.md`
   - `docs/deployments.md`

## Narration script

### 0:00-0:20 - Problem and thesis
"Most onchain agents are either smart but ungoverned, or governed but brittle. Institutional Policy OS v2 makes them both verifiable and execution-reliable."

### 0:20-0:45 - Triple-verified architecture
"Our flow is triple-verified: intent verification, deterministic policy process integrity, and outcome attestation with encrypted run artifacts."

### 0:45-1:15 - ENS identity and role passport
"ENS is a functional dependency. Agent role identities resolve from ENS, authorization is checked from records, and reverse-resolution verification powers a trustable identity passport."

### 1:15-1:50 - 0G compute and memory evidence
"Before execution, planner/critic preflight inference runs through the 0G adapter. Outputs are persisted as encrypted memory artifacts and later anchored with a chain attestation reference."

### 1:50-2:25 - KeeperHub reliability branch demo
"The same logic branches into safe-path and escalated-path workflows. KeeperHub execution returns run IDs, log counts, terminal states, and analytics so we can prove reliability under pressure."

### 2:25-2:30 - Close
"This is reusable open infrastructure: PolicyGraph SDK adapters, ENS identity passports, 0G verifiable intelligence, and KeeperHub execution reliability."

## On-screen callouts to include
- JSON fields: `identityPassport`, `computePreflight`, `memoryArtifacts`, `chainAttestation`.
- JSON fields: `plan.pathType`, `workflowId`, `runId`, `reconciliationState`, `runLogCount`, `reliabilityAnalytics`.
- Mention `KEEPERHUB_MOCK_FINAL_STATE` for deterministic sponsor demo fallback.
