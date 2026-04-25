# Deployment Addresses

Current status: pending live deployment (safe fail-closed behavior verified in offline dry run).

## Networks
- ENS read network: Ethereum mainnet
- Policy registry network: Base Sepolia (default MVP)

## Contracts
- `PolicyRegistry`: `pending`
- Optional ERC-8004 registry: `n/a (optional in MVP)`

## Demo ENS names
- Fund ENS: `eurofund.eth`
- Agent ENS: `algo1.eurofund.eth`

## Dry-run notes
- `npm run demo:deterministic` executed without `.env` RPC values.
- Result: explicit fail-closed denies with `ENS_LOOKUP_FAILED` (expected safety behavior).
- Next step: set `ENS_MAINNET_RPC_URL`, `BASE_SEPOLIA_RPC_URL`, `POLICY_REGISTRY_ADDRESS`, then rerun demos for final judge recording.
