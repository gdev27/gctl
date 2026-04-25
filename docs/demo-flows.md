# Demo Flows

## Small trade flow
1. Agent calls `PolicyClient.planAction(...)` for amount `10,000`.
2. Engine returns:
   - `allowed=true`
   - `pathType=batch-auction`
   - `route=public`
   - `shouldReport=false`
3. KeeperHub workflow builder emits `small-trade-cowswap`.
4. Reconciliation stores terminal status and audit artifact.

## Large trade flow
1. Agent calls `PolicyClient.planAction(...)` for amount `250,000`.
2. Engine returns:
   - `allowed=true`
   - `pathType=direct-swap`
   - `route=private-mempool` (or shielded)
   - `shouldReport=true`
3. KeeperHub workflow includes private route + report HTTP step.
4. Reconciliation stores terminal status and redacted/encrypted audit artifact.
