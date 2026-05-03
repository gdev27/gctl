# Workspace isolation (Hardhat vs 0G Storage SDK)

## Current state

The repository uses a **single** npm package at the root. Hardhat and application code share one `ethers` line (`^6.16.0`). The official `@0gfoundation/0g-storage-ts-sdk` peer (`ethers` `6.13.1` exact) cannot be merged into that graph on strict npm without `--legacy-peer-deps` (see [zerog-storage-sdk-peer.md](./zerog-storage-sdk-peer.md)).

## Isolation pattern in use

1. **Runtime:** Optional dynamic import in [agent-sdk/src/zeroG.ts](../agent-sdk/src/zeroG.ts) so the SDK is not required for `npm ci`.
2. **Tooling:** [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/) is a **standalone** `package.json` (not an npm workspace member) with only `ethers@6.13.1` and the SDK, used for smoke tests and as a reference layout for operators.

## Future: split packages (pnpm or npm workspaces)

If upstream never relaxes the SDK peer and you must eliminate `legacy-peer-deps` for production installs, consider:

- **`packages/contracts`:** Hardhat, toolbox, Solidity sources, `hh:compile` / `hh:test`; depends on `ethers` satisfying the toolbox peer (`^6.14.0`).
- **`packages/app` (or root runtime):** Agent SDK, policy engine, Vitest app tests; `ethers` `^6.16.0`; **no** `@0gfoundation/0g-storage-ts-sdk` in this package if peers still conflict at the hoisted root.

**pnpm** is often easier here than npm alone because `packageExtensions` or patched dependencies can adjust peer metadata consistently. Hoisting can still merge incompatible peers into one virtual store node; validate with a dry-run install.

A **sidecar** micro-package or subprocess that owns `ethers@6.13.1` + the SDK is the strongest isolation but adds deployment and IPC cost.

This document is the outcome of the “workspace split” evaluation: **no split was applied to the main tree** in the current change set; the integration package and docs preserve a migration path.
