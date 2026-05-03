# Draft: GitHub issue for `@0gfoundation/0g-storage-ts-sdk`

**Title:** Widen `peerDependencies.ethers` beyond exact `6.13.1` (Hardhat 3 / ethers 6.14+ compatibility)

**Body:**

## Problem

`@0gfoundation/0g-storage-ts-sdk` declares:

```json
"peerDependencies": {
  "ethers": "6.13.1"
}
```

The exact pin conflicts with current Ethereum tooling that requires **`ethers` `^6.14.0`**, including `@nomicfoundation/hardhat-toolbox-mocha-ethers` (and typical app stacks on **`ethers` 6.16.x**). npm fails dependency resolution (`ERESOLVE`) when both are installed in the same project without `--legacy-peer-deps`.

## Request

Please widen the peer to a semver range validated against your test suite, for example:

- `"ethers": "^6.14.0"`, or
- `"ethers": ">=6.13.1 <7"`

## Context

Downstream consumers use the SDK for storage upload/download alongside Hardhat-based contract workflows. An exact `6.13.1` peer forces either dependency isolation, legacy peer installs, or skipping the SDK in the main package graph.

## Offer to help

Happy to run a quick smoke (import + `Indexer` / `ZgFile` usage) against `ethers@6.16.0` and report results if useful for the change.
