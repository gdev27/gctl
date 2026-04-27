# Adapter Contracts

Institutional Policy OS v2 uses stable adapter interfaces so builders can swap infra providers without rewriting policy logic.

## Contract surfaces

- **Memory adapter**
  - `write(envelope)` persists encrypted/shared swarm memory.
  - `read(namespace, key)` loads prior memory state.
  - Primary implementation target: 0G Storage.

- **Inference adapter**
  - `infer(request)` executes role-aware reasoning with provider metadata.
  - Primary implementation target: 0G Compute.

- **Chain adapter**
  - `anchorAttestation(input)` writes execution proof references onchain.
  - Primary implementation target: 0G Chain.

- **Identity adapter**
  - `getProfile(ensName)` resolves identity passport and role metadata.
  - `verifyAuthorization(ensName)` validates caller eligibility.
  - Primary implementation target: ENS resolver records + reverse checks.

- **Execution adapter**
  - `execute(request)` runs policy-approved actions and returns auditable outcomes.
  - Primary implementation target: KeeperHub workflows and reconciliation.

## Design invariants

- **Fail closed:** adapter failures must return deny paths for value-moving actions.
- **Deterministic proof object:** every adapter output is serializable and hashable.
- **Protocol agility:** adapters are protocol-specific; policy engine is protocol-agnostic.
- **Composable by default:** swarm roles share one contract shape, not provider-specific APIs.

## Reference implementation

Interfaces and types live in `agent-sdk/src/adapters.ts`.

