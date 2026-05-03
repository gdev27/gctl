# Isolated 0G Storage SDK install

This directory is a **standalone** npm package (not linked via npm workspaces to the repo root). It exists so CI and operators can install `@0gfoundation/0g-storage-ts-sdk` with **`ethers@6.13.1`**, matching the SDK’s published peer, without touching the root `ethers` ^6.16 / Hardhat graph.

- Install: `npm ci` (from this directory).
- Smoke: `node smoke.mjs`.

See [docs/zerog-storage-sdk-peer.md](../../docs/zerog-storage-sdk-peer.md) for why the main app does not declare this SDK as a dependency.
