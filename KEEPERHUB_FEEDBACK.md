# KeeperHub Builder Feedback (Actionable)

This report is based on integrating KeeperHub into policy-constrained autonomous execution flows.

## 1) Authentication docs ambiguity

- **Area:** API auth docs.
- **Observed friction:** Different key prefixes and auth header examples appear across surfaces (`kh_...` vs `keeper_...`) which creates uncertainty during first integration.
- **Impact:** Slows time-to-first-success and causes avoidable 401 retries.
- **Suggestion:** Add one canonical auth matrix by endpoint group (MCP/API/CLI) with exact accepted key format examples.

## 2) Execution logs endpoint discoverability

- **Area:** run-level observability.
- **Observed friction:** Logs and analytics are available but not always linked from workflow execution quick paths.
- **Impact:** Builders often stop at status polling and miss reliability insights.
- **Suggestion:** Add a “post-execution observability checklist” in docs that includes logs and analytics endpoints with sample curl commands.

## 3) Error taxonomy for payment-gated workflows

- **Area:** paid workflow and payment rails integration.
- **Observed friction:** Builders need explicit error categories (insufficient balance, payment challenge mismatch, spend cap) to build robust retry policy.
- **Impact:** Harder to differentiate recoverable vs non-recoverable failures in autonomous loops.
- **Suggestion:** Publish structured error codes and recommended retry strategy per code.

## 4) MCP onboarding UX for multi-org teams

- **Area:** MCP setup.
- **Observed friction:** Multi-org context configuration is powerful but setup sequence is non-obvious for first-time teams.
- **Impact:** Manual trial-and-error when switching organizations.
- **Suggestion:** Add a short guide: “MCP with multiple orgs in 5 minutes” including naming conventions for local MCP entries.

## 5) Suggested quality-of-life features

- Exportable “run replay bundle” JSON including workflow metadata, node logs, and explorer links.
- Built-in analytics deltas between time windows (last 1h vs previous 1h).
- Guardrail templates for common policy checks (max amount, allowed tokens, emergency stop).

## Reproducibility notes

- Integration path used:
  - workflow creation + execution + status polling
  - reconciliation artifact generation
  - log count and analytics extraction
- Environment:
  - Node + TypeScript local runner
  - deterministic fallback using mock client for repeatable CI tests

