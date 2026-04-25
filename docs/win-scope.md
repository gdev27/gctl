# Win Scope Freeze

This file freezes the judging-focused scope so the team can ship reliably before deadline.

## Primary and secondary tracks
- Primary: KeeperHub - Best Use of KeeperHub.
- Secondary: ENS - Best ENS Integration for AI Agents.
- Optional stretch: 0G integration only if core demo is stable and fully tested.

## Demo-critical scope (must ship)
- Deterministic policy compiler + engine that creates different plans for small vs large trades.
- Intent and identity checks through ENS metadata + agent authorization record.
- On-chain policy hash anchoring via `PolicyRegistry`.
- KeeperHub workflow mapping + execution + reconciliation terminal states.
- Redacted/encrypted audit artifact output.
- End-to-end demo scripts with reproducible JSON outputs.

## Backlog (explicitly parked)
- TEE/ZK proof generation (keep hook points only).
- Full production indexer pipeline (current local index state is sufficient for demo).
- Multi-chain registry deployment automation beyond Base Sepolia.
- No-code UI for policy authoring.
- Expanded protocol connectors beyond current two-route flow.
