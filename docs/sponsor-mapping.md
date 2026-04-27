# Sponsor Feature Mapping

## 0G (Framework + Autonomous Agents)
- **0G Storage (meaningful use)**
  - Persistent memory and execution artifacts via storage adapter interface in `policy-engine/src/storageAdapter.ts` and `agent-sdk/src/adapters.ts`.
  - 0G-specific adapter implementation in `agent-sdk/src/zeroG.ts`.
- **0G Compute (meaningful use)**
  - Planner/critic reflection and provider metadata capture in `agent-sdk/src/zeroG.ts`.
  - Swarm reasoning loop in `examples/treasuryTwinSwarm.ts`.
- **0G Chain (meaningful use)**
  - Policy and execution anchoring through `contracts/PolicyRegistry.sol` and attestation writer flow in `agent-sdk/src/zeroG.ts`.
- **Framework-level depth**
  - Adapter contracts, extension points, and CLI-ready patterns in `docs/adapter-contracts.md`, `docs/extension-cookbook.md`.

## ENS (Identity + Creative Use)
- **Identity as infrastructure**
  - ENS policy discovery and authorization in `agent-sdk/src/ensResolver.ts`.
  - Reverse-check verification and identity passport generation in `agent-sdk/src/ensResolver.ts`.
- **Subname and role model**
  - Role-bound identity records (`planner`, `researcher`, `critic`, `executor`) configured by `ens-identity/scripts/setEnsRecords.ts`.
- **Discoverability**
  - Identity profile metadata consumed by swarm and exposed in demo output via `examples/treasuryTwinSwarm.ts`.

## KeeperHub (Execution + Reliability)
- **Execution reliability**
  - Policy-to-workflow branching in `keeperhub-workflows/src/buildFromPlan.ts`.
  - Runtime execution and reconciliation in `keeperhub-workflows/src/runDemo.ts` and `keeperhub-workflows/src/reconcile.ts`.
- **Evidence and observability**
  - Terminal state normalization, encrypted audit logs, and analytics summary in `keeperhub-workflows/src/reconcile.ts`.
- **Integration quality**
  - Mock and HTTP clients, integration tests, and failure injection in `keeperhub-workflows/src/client.ts`, `keeperhub-workflows/src/client.mock.ts`, and `test/`.

## Judging Criteria Mapping
- **Utility over novelty:** autonomous actions are policy-bound and operationally reliable.
- **Technical depth:** combines identity, verifiable inference hooks, and audited execution.
- **Mergeable quality:** adapter boundaries, tests, runbooks, and open extension documentation.
