# CI Profile

## Deterministic CI steps
1. `npm run build`
2. `npm run test`
3. `npm run hh:compile`
4. `npm run hh:test`

## Mocked external integrations
- Set `KEEPERHUB_USE_MOCK=true` to avoid external API dependency.
- Use local storage adapter (`POLICY_STORAGE_ADAPTER=local`).

## Optional gated jobs
- Mainnet fork integration tests require `MAINNET_RPC_URL`.
- Live KeeperHub integration requires `KEEPERHUB_API_URL` and `KEEPERHUB_API_KEY`.
