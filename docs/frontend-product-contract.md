# Frontend Product Contract

## Product intent
The gctl frontend is the consumer-facing control plane for policy-constrained autonomous execution. It must make trust and reliability visible while keeping the happy path fast for first-time operators.

## Primary personas
- **Treasury operator (new):** wants guided setup and confidence that actions are safe.
- **Protocol operator (advanced):** needs quick status scanning, filtering, and direct evidence drill-down.
- **Compliance reviewer:** needs policy and execution proof artifacts without deep code context.

## Core journeys
1. **Onboarding and readiness**
   - User lands on dashboard and runs environment readiness checks.
   - User sees pass/fail status for indexer connectivity and data freshness.
2. **Policy understanding**
   - User browses active policies, hashes, and URIs.
   - User can identify stale or inactive policy records quickly.
3. **Run monitoring**
   - User reviews deterministic and swarm run outcomes with terminal states.
   - User sees fail-closed alerts and can pivot to run details.
4. **Evidence review**
   - User inspects identity and attestation surfaces in one place.
   - User can trace from a run to its audit path and proof metadata.
5. **Operations and settings**
   - User configures endpoints and operating mode with clear defaults.
   - User can tell whether the environment is in demo-safe or production mode.

## Information architecture
- **Dashboard:** high-signal overview, alerts, and status cards.
- **Onboarding:** environment checks and guided first-run workflow.
- **Policies:** policy inventory and integrity context.
- **Runs:** deterministic and swarm run center with status timelines.
- **Swarm:** role-wise view of planner/researcher/critic/executor loop.
- **Evidence:** trust artifacts (identity, audit, attestation pointers).
- **Settings:** endpoint and product behavior configuration.

## UX principles
- **Trust is visible:** every decision view includes reason and source.
- **Progressive disclosure:** simple defaults first, deep details on demand.
- **Fast operations:** filterable lists, consistent state colors, keyboard-friendly controls.
- **Graceful failure:** explicit fail-closed messaging with recovery actions.

## Ops API trust envelope contract
- Every `/api/ops/*` payload returns:
  - `source`: `live` or `fallback`
  - `trustStatus`: `healthy`, `degraded`, or `fallback`
  - `reasonCode`: stable machine-readable cause when not healthy
  - `recoveryAction`: operator action text to restore healthy state
- `source=fallback` and `trustStatus=fallback` must never be rendered as production-live telemetry.
- `trustStatus=degraded` is reserved for partial trust conditions (for example stale data) where connectivity exists but evidence confidence is reduced.

## Visual system contract
- **Aesthetic direction:** calm institutional cockpit (premium fintech clarity over decorative web3 styling).
- **Hierarchy contract:** strong page headers, semantic KPI cards, and consistent content rhythm on an 8px spacing grid.
- **Control contract:** shared button/input/select/table primitives for all routes; no raw browser-default form controls on primary flows.
- **Evidence contract:** policy IDs, hashes, attestations, and audit paths are rendered in monospace with copy affordances.
- **Data source contract:** whenever fallback snapshots are shown, pages must display explicit disclosure so synthetic data is never mistaken for live state.

## Success metrics
- **Activation:** first successful onboarding completion under 2 minutes.
- **Comprehension:** users can explain allow/deny outcomes from UI without logs.
- **Operational speed:** median time to locate a failed run under 30 seconds.
- **Reliability perception:** no ambiguous terminal-state messaging in critical views.
