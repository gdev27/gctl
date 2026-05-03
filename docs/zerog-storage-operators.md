# 0G storage operators: env vars and installing the official SDK

Longer-term repo layout options (pnpm/npm workspaces): [workspace-isolation.md](./workspace-isolation.md).

For **default** local development you do **not** need `@0gfoundation/0g-storage-ts-sdk`; encrypted artifacts stay under `ZEROG_MEMORY_DIR` (default `./.zerog-memory`) with optional HTTP upload when configured.

## When the official SDK is used

[agent-sdk/src/zeroG.ts](../agent-sdk/src/zeroG.ts) calls the SDK only for **remote** indexer upload/download when both indexer and signer RPC material are present. Typical variables:

| Variable | Role |
|----------|------|
| `ZEROG_MEMORY_DIR` | Local encrypted artifact directory (default `./.zerog-memory`) |
| `ZEROG_STORAGE_INDEXER_URL` | Base URL for the 0G indexer API (required for SDK indexer path) |
| `ZEROG_STORAGE_RPC_URL` or `ZEROG_CHAIN_RPC_URL` | JSON-RPC URL passed to `JsonRpcProvider` for signing uploads |
| `ZEROG_STORAGE_PRIVATE_KEY` | Hex private key for `Wallet` signer used with the indexer |
| `ZEROG_STORAGE_ENDPOINT` | Optional HTTP POST fallback when SDK path is not used |
| `ZEROG_STORAGE_DOWNLOAD_URL` | Optional HTTP download template when indexer download is unavailable |

Compute and chain paths use separate variables (`ZEROG_COMPUTE_*`, `ZEROG_ATTESTATION_*`, etc.); see [.env.example](../.env.example) if present.

## Installing the SDK beside this repo

Because of the **`ethers` peer conflict** ([zerog-storage-sdk-peer.md](./zerog-storage-sdk-peer.md)), the SDK is **not** a root `package.json` dependency. To run code paths that `import("@0gfoundation/0g-storage-ts-sdk")` from the same Node tree as this repo:

```bash
npm install @0gfoundation/0g-storage-ts-sdk@1.2.8 --legacy-peer-deps --no-save
```

Use **`--no-save`** if you only need a local experiment; omit it to record in `package.json` (you will still need **`--legacy-peer-deps`** or an isolated install until upstream widens peers).

**Isolated install** (no legacy flag on the main app): use the minimal tree under [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/) for tooling that only needs the SDK + `ethers@6.13.1`.

## Automated smoke

GitHub Actions workflow `zerog-storage-sdk-smoke` runs weekly and on `workflow_dispatch` using the isolated tree under [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/). See [.github/workflows/zerog-storage-sdk-smoke.yml](../.github/workflows/zerog-storage-sdk-smoke.yml).

## Manual Vitest smoke (optional)

`npm run test:zerog-sdk-legacy-smoke` with `GCTL_ZEROG_SDK_MANUAL_SMOKE=1` only makes sense when `@0gfoundation/0g-storage-ts-sdk` is already resolvable and the rest of `node_modules` is coherent (for example a dedicated clone or branch). Avoid `npm install … --legacy-peer-deps --no-save` on your primary working copy; it can remove large portions of the tree on recent npm.

```bash
GCTL_ZEROG_SDK_MANUAL_SMOKE=1 npm run test:zerog-sdk-legacy-smoke
```
