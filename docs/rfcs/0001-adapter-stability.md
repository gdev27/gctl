# RFC 0001: Adapter Stability Contract

## Status
Accepted

## Context

Partner integrations evolve quickly. Without a stable internal contract, every provider change breaks core policy logic.

## Decision

We define stable adapter contracts in `agent-sdk/src/adapters.ts` and require:
- deterministic outputs
- fail-closed behavior on errors
- serializable proof objects suitable for hashing and replay

## Consequences

- Positive:
  - protocol agility with low refactor cost
  - testability across mocked and live environments
  - straightforward open-source extension path
- Tradeoff:
  - adapter implementations must map provider-specific fields into canonical shapes

