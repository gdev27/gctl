# Architecture

```mermaid
flowchart LR
  compliance["ComplianceYAML"] --> dslValidator["DSLValidator"]
  dslValidator --> compiler["PolicyCompiler"]
  compiler --> storage["PolicyStorageAdapter"]
  compiler --> policyRegistry["PolicyRegistry(L2)"]
  guardian["GuardianMultisig"] --> policyRegistry

  agent["Agent"] --> policyClient["PolicyClientSDK"]
  policyClient --> ens["ENSResolver(Mainnet)"]
  ens --> policyRegistry
  policyClient --> storage
  policyClient --> engine["PolicyEngine"]
  engine --> plan["ExecutionPlan"]

  plan --> workflows["KeeperHubWorkflowBuilder"]
  workflows --> keeperhub["KeeperHub"]
  keeperhub --> reconcile["Reconciliation"]
  reconcile --> privacy["Redact+Encrypt Audit"]
  privacy --> logs["Audit Logs"]
  policyRegistry --> indexer["Indexer"]
  reconcile --> indexer
  indexer --> api["Compliance API"]
```

## Trust boundaries
- **Mainnet ENS** is source of policy discovery and agent authorization metadata.
- **L2 PolicyRegistry** anchors policy hash + active state for cheaper policy updates.
- **Storage adapter** stores full policy graph and must match on-chain hash.
- **PolicyClient** is fail-closed: dependency failure always produces deny.
