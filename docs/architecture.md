# Architecture

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
- **0G Storage memory** persists encrypted swarm context and execution artifacts.
- **KeeperHub** executes policy-approved actions with run-level observability.
- **PolicyClient is fail-closed**: dependency or verification failures default to deny.
