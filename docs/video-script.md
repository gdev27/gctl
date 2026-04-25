# 2-3 Minute Judging Video Script

## Target runtime
- 2 minutes 30 seconds total.

## Recording prep
1. Run:
   ```bash
   npm run demo:deterministic
   ```
2. Keep terminal with resulting JSON output visible.
3. Open:
   - `docs/architecture.md`
   - `docs/triple-verified.md`
   - `docs/sponsor-mapping.md`

## Narration script

### 0:00-0:20 - Problem and thesis
"Most on-chain agents fail at reliability and verifiability. We built Institutional Policy OS to enforce deterministic policy controls before execution, then route execution through KeeperHub with auditable outcomes."

### 0:20-0:45 - Triple-verified architecture
"Our flow is triple-verified: intent is signature-verified, process integrity is deterministic policy compilation/evaluation, and outcome is anchored via on-chain policy hash checks plus reconciled run artifacts."

### 0:45-1:20 - ENS identity and policy discovery
"Here, ENS text records provide policy discovery and agent authorization. We also use ENS execution profile metadata to influence runtime routing decisions, so ENS is a functional dependency, not cosmetic."

### 1:20-2:05 - Live deterministic demo
"Now we run identical agent logic twice. For a 10k swap, policy returns batch auction/public route. For a 250k swap, policy routes to direct swap/private path with reporting. KeeperHub workflow IDs, run IDs, and reconciliation states are emitted."

### 2:05-2:25 - KeeperHub depth and reliability
"Execution is submitted to KeeperHub, then reconciled to terminal states. We persist redacted/encrypted audit artifacts so compliance gets replayable evidence without leaking sensitive payloads."

### 2:25-2:30 - Close
"This is reusable infra for agentic Ethereum: policy DSL, fail-closed planning SDK, ENS identity integration, and reliable execution adapters."

## On-screen callouts to include
- JSON fields: `plan.pathType`, `plan.route`, `workflowId`, `runId`, `reconciliationState`, `auditPath`.
- Mention `KEEPERHUB_MOCK_FINAL_STATE` for deterministic sponsor demo fallback.
