# Demo Flows

## Deterministic policy demo (single agent)

### Safe-path flow (small amount)
1. Agent calls `PolicyClient.planAction(...)` for amount `10,000`.
2. Policy engine returns `allowed=true`, `pathType=batch-auction`, `route=public`.
3. Workflow router emits `safe-path-small-trade`.
4. KeeperHub execution succeeds and reconciliation writes encrypted audit output.

### Escalated-path flow (large amount)
1. Agent calls `PolicyClient.planAction(...)` for amount `250,000`.
2. Policy engine returns `allowed=true`, `pathType=direct-swap`, `route=private-mempool`, `shouldReport=true`.
3. Workflow router emits `escalated-path-large-trade` with execution + reporting steps.
4. Reconciliation writes state, logs, and analytics summary.

### Blocked-path flow (policy breach)
1. Agent submits an action that violates limits or authorization.
2. Policy engine returns `allowed=false` with explicit deny reason.
3. Workflow is not submitted to KeeperHub.
4. System emits denial trace and immutable proof payload for review.

## Swarm demo (four-agent loop)
1. `planner` creates initial action intent from treasury objective.
2. `researcher` enriches context and adds market/risk signals.
3. `critic` challenges plan and either rejects or asks for revision.
4. `executor` runs allowed plans through KeeperHub and records proofs.
5. Shared memory and role identities are persisted via 0G and ENS metadata.
