# Institutional Policy OS v2: Agent Reliability Fabric

Institutional Policy OS v2 is an open-source framework and reference implementation for policy-constrained autonomous agents that can safely move value onchain.

It combines:
- **0G** for verifiable compute + encrypted persistent memory + onchain attestations.
- **ENS** for agent identity, discovery, and delegated trust.
- **KeeperHub** for reliable execution, retries, and auditable run traces.

Built by Gaurav Dev.

## Why this project exists
Teams can prototype agents quickly, but production deployment still fails on three fronts:
- **Trust:** hard to prove how decisions were produced.
- **Governance:** hard to ensure behavior stays within institutional policy.
- **Execution reliability:** hard to guarantee actions settle predictably onchain.

Institutional Policy OS v2 addresses this with a reusable framework and a flagship swarm reference app.

## Product strategy
- **Framework:** `PolicyGraph SDK` with adapter interfaces for 0G, ENS, and KeeperHub.
- **Flagship app:** `TreasuryTwin Swarm` with planner, researcher, risk critic, and executor roles.
- **Proof system:** deterministic policy traces + identity checks + execution logs + chain attestation.

## Prize alignment
- **0G Framework, Tooling & Extensions:** modular adapter-based framework, verifiable compute hooks, storage anchoring.
- **0G Autonomous Agents & Swarms:** four-role swarm with shared memory and reflection loop.
- **ENS Integration + Creative ENS:** ENS identity passport, subname role identities, and registry attestation records.
- **KeeperHub Best Use:** policy-driven execution branches, retries, status logs, analytics, and paid workflow support.

## Quickstart
```bash
npm install
cp .env.example .env
npm run compile:policy
npm run demo:init
npm run demo:deterministic
```

## Core commands
```bash
npm run hh:compile
npm run hh:test
npm run test
npm run test:integration
npm run compile:policy
npm run demo:init
npm run demo:deterministic
npm run demo:swarm
```

## End-to-end demo path
1. Deploy `PolicyRegistry`:
   ```bash
   npx hardhat run scripts/deployPolicyRegistry.ts --network baseSepolia
   ```
2. Set `POLICY_REGISTRY_ADDRESS` in `.env`.
3. Compile/register policy and initialize metadata:
   ```bash
   npm run compile:policy
   npm run demo:init
   ```
4. Configure ENS records:
   ```bash
   npx tsx ens-identity/scripts/setEnsRecords.ts
   ```
5. Run deterministic dual-branch policy execution:
   ```bash
   npm run demo:deterministic
   ```
6. Run the multi-agent swarm reference flow:
   ```bash
   npm run demo:swarm
   ```

## Submission and engineering assets
- Sponsor mapping: `docs/sponsor-mapping.md`
- Architecture: `docs/architecture.md`
- Adapter contracts: `docs/adapter-contracts.md`
- Demo walkthrough: `docs/demo-flows.md`
- Security model: `docs/security-model.md`
- Operations runbook: `docs/operations.md`
- Contribution model: `CONTRIBUTING.md`
- Extension cookbook: `docs/extension-cookbook.md`
- Versioning policy: `docs/versioning-policy.md`
- Final checklist: `docs/submission-checklist.md`
- Video plan: `docs/video-script.md`
- KeeperHub actionable feedback: `KEEPERHUB_FEEDBACK.md`

## Repository map
- `contracts/`: onchain policy registry + attestation contracts.
- `dsl/`: policy schema, validation, and sample policies.
- `policy-engine/`: deterministic policy compiler and evaluator.
- `agent-sdk/`: agent client, adapters, ENS identity, 0G and KeeperHub connectors.
- `keeperhub-workflows/`: workflow routing, execution, reconciliation, analytics.
- `ens-identity/`: ENS metadata and role/subname management scripts.
- `indexer/`: indexed state + compliance API scaffold.
- `scripts/`: deployment and deterministic/simulation demos.
- `test/`: unit, integration, and failure-injection tests.
- `examples/`: open-source reference scenarios and starter templates.
