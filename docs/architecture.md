# Architecture

This document is the **single-page mental model** for gctl: who touches policy, where identity is enforced, how execution leaves the building, and which trust boundaries are non-negotiable. Read it top-to-bottom once, then keep [`trust-invariants.md`](./trust-invariants.md) open beside it for the formal `INV-*` contracts.

**In one sentence:** policy is compiled and anchored, the client is fail-closed, ENS establishes accountable roles, KeeperHub carries approved work to terminal states, and 0G adapters add compute, durable memory, and explicit attestation receipts, without collapsing those concerns into “one more API call.”

```mermaid
flowchart LR
  PolicyAuthor[PolicyAuthor] --> DSL[PolicyDSL]
  DSL --> Compiler[DeterministicCompiler]
  Compiler --> PolicyRegistry[PolicyRegistryOnchain]
  Compiler --> StorageAdapter[PolicyStorageAdapter]

  UserOrDAO[UserOrDAO] --> PolicyClient[PolicyClientSDK]
  PolicyClient --> ENSResolver[ENSResolver]
  ENSResolver --> IdentityPassport[IdentityPassport]
  PolicyClient --> Engine[PolicyEngine]
  PolicyClient --> StorageAdapter
  Engine --> Decision[ExecutionPlan]

  Decision --> WorkflowRouter[KeeperHubWorkflowRouter]
  WorkflowRouter --> KeeperHubExec[KeeperHubExecution]
  KeeperHubExec --> Reconcile[ReconciliationAndAnalytics]
  Reconcile --> AuditLogs[EncryptedAuditLogs]

  PolicyClient --> ZeroGCompute[0GComputeAdapter]
  PolicyClient --> ZeroGMemory[0GStorageMemory]
  Reconcile --> ZeroGMemory
  Reconcile --> ZeroGChain[0GChainAttestation]

  SwarmPlanner[PlannerAgent] --> ZeroGCompute
  SwarmResearcher[ResearcherAgent] --> ZeroGCompute
  SwarmCritic[CriticAgent] --> ZeroGCompute
  SwarmExecutor[ExecutorAgent] --> WorkflowRouter
  ZeroGMemory --> OpsUI[OpsDashboard]
  IdentityPassport --> OpsUI
  ZeroGChain --> OpsUI
  AuditLogs --> OpsUI
```

## Trust boundaries
- **Mainnet ENS** provides identity, role metadata, and authorization attestations.
- **PolicyRegistry** anchors canonical policy hashes and active status.
- **0G Storage memory** persists encrypted swarm context and execution artifacts. Optional remote indexer upload/download may load `@0gfoundation/0g-storage-ts-sdk` at runtime (not a root npm dependency); see [zerog-storage-sdk-peer.md](./zerog-storage-sdk-peer.md) and [zerog-storage-operators.md](./zerog-storage-operators.md).
- **KeeperHub** executes policy-approved actions with run-level observability.
- **PolicyClient is fail-closed**: dependency or verification failures default to deny.

## Frontend operations surface
- `web/` (Vite + React 18 SPA at https://gctl.vercel.app) provides the primary operator UI for onboarding, policies, runs, swarm state, alerting, team, and evidence views.
- Vercel Functions in `api/ops/*` normalize indexer responses for dashboard consumption; `api/functions/debate-policy.js` runs the LLM-backed policy synthesizer with a deterministic fallback.
- UI defaults to deterministic fallback snapshots (`api/_lib/mock-data.js`) when runtime endpoints are unavailable so trust workflows stay inspectable.
- API and page layers carry explicit `source` semantics (`live` or `fallback`) plus `trustStatus`/`reasonCode`/`recoveryAction` to preserve operator trust and prevent synthetic data confusion.
