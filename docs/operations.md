# Operations Runbook

## Emergency pause drill
1. Guardian multisig executes `PolicyRegistry.pause()`.
2. Confirm contract paused state.
3. Verify policy mutations fail in tests and monitoring.
4. Investigate incident, prepare mitigation.
5. Admin executes `unpause()` after approval.

## Key rotation SOP
1. Generate new agent key in secure vault.
2. Update runtime secrets:
   - `AGENT_PRIVATE_KEY`
   - `AGENT_KEY_VERSION`
3. Restart agent runtime and verify signed health transaction.
4. Disable previous key.

## Reconciliation monitoring
- Track terminal states:
  - `succeeded`, `reverted`, `partial_fill`, `timed_out`, `cancelled`.
- Alerts for `reverted` / `timed_out`.
- Store audit log path and index into compliance API.
