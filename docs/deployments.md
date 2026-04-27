# Deployment Addresses

Current status: pending final mainnet/testnet publish. Local and mocked paths already produce deterministic evidence bundles.

## Networks
- ENS read network: Ethereum mainnet
- Policy registry network: Base Sepolia
- 0G chain attestation target: 0G Testnet (`16602`)

## Contracts
- `PolicyRegistry`: `pending`
- `ExecutionAttestation` (if separated from registry): `pending`
- Optional ERC-8004 registry: `n/a (optional in MVP)`

## Policy URI requirements
- `PolicyMeta.uri` should resolve to immutable content-addressed artifacts.
- For local development this may be `file://...` or `og://stub/...`.
- For production, replace stub URIs with CID-backed identifiers (or an equivalent cryptographically verifiable URI scheme) so on-chain references remain tamper-evident.

## Demo ENS names
- Fund ENS: `eurofund.eth`
- Executor ENS: `executor.eurofund.eth`
- Role ENS (swarm): `planner.eurofund.eth`, `researcher.eurofund.eth`, `critic.eurofund.eth`, `executor.eurofund.eth`

## Dry-run notes
- `npm run demo:deterministic` and `npm run demo:swarm` pass in deterministic mode.
- `npm run test` and `npm run typecheck` pass on current branch.
- If RPC values are missing, system returns fail-closed denies with explicit error codes.
- Final pre-submission: set live RPC and contract addresses, rerun both demos, then update this file with actual addresses and explorer links.
