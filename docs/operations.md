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

## Environment contract and startup checks
1. Keep browser-exposed variables in `web/.env.example` under `VITE_*` (Vite's public namespace). Server-only secrets used by Vercel Functions live in the project-level Vercel env (e.g. `INDEXER_URL`, `OPENAI_API_KEY`, `FUND_ENS_NAME`) and must never appear under `VITE_*`.
2. Never place secret-like keys (`*_PRIVATE_KEY`, `*_TOKEN`, `*_SECRET`, `*_JWT`, `*_API_KEY`) in the `VITE_*` namespace.
3. Validate env contracts before judge/demo runs:
   - `npm run validate:env`
6. Run full judge preflight before submission:
   - `npm run judge:preflight`
   - Review `docs/evidence/judge-preflight-report.md`
4. Demo-critical ENS identity values must be explicit:
   - `FUND_ENS_NAME`
   - `AGENT_ENS_NAME`
5. Deterministic demo scripts fail loudly when required env keys are missing; they do not silently fall back to hardcoded trust identities.
