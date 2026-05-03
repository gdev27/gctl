# 0G Storage TypeScript SDK and `ethers` peer dependency

## Conflict

- Root app and Hardhat use **`ethers` `^6.14.0`** (Hardhat toolbox declares `ethers` `^6.14.0` as a peer; this repo pins **`^6.16.0`** in [package.json](../package.json)).
- `@0gfoundation/0g-storage-ts-sdk` declares a **strict** peer: **`ethers` `6.13.1`** (exact).

npm therefore reports **`ERESOLVE`** if the official SDK is added as a normal or optional dependency next to the current Hardhat stack. Those constraints cannot be satisfied simultaneously in a single flat install without relaxing peer checks.

## Why optional dynamic import (current design)

[agent-sdk/src/zeroG.ts](../agent-sdk/src/zeroG.ts) loads `@0gfoundation/0g-storage-ts-sdk` only through a runtime dynamic import on env-gated remote storage paths, and the package is **not** listed in root `package.json`. Default `npm ci` stays clean; operators who need live 0G storage install the SDK in an environment that tolerates peer mismatch (see [zerog-storage-operators.md](./zerog-storage-operators.md)).

## Upstream request (preferred long-term fix)

File an issue or PR against `@0gfoundation/0g-storage-ts-sdk` asking to widen `peerDependencies.ethers` to a range compatible with the Hardhat line, for example **`^6.14.0`** or **`>=6.13.1 <7`**, after validating the SDK against **6.16.x**.

Draft title and body: [docs/upstream/ISSUE-DRAFT-0g-storage-ts-sdk-ethers-peer.md](./upstream/ISSUE-DRAFT-0g-storage-ts-sdk-ethers-peer.md).

## patch-package and npm resolution

Patching `node_modules/@0gfoundation/0g-storage-ts-sdk/package.json` after install (for example with `patch-package`) **does not** change metadata npm uses **before** install completes. The resolver still reads the published peer range from the registry and can fail with **`ERESOLVE`** before `postinstall` runs. So **patch-package alone is not sufficient** to add this SDK to the root lockfile on strict npm without also using **`legacy-peer-deps`**, an **isolated package** (see [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/)), or **upstream** widening.

## CI coverage

[.github/workflows/zerog-storage-sdk-smoke.yml](../.github/workflows/zerog-storage-sdk-smoke.yml) (weekly and `workflow_dispatch`) installs only `ethers@6.13.1` + the SDK under [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/) and runs `smoke.mjs` (canonical peer pairing). A root `npm ci` followed by `npm install … --legacy-peer-deps --no-save` is **not** run in CI: on current npm, that style of install can aggressively dedupe or prune unrelated packages and is unsafe for the main lockfile.

## Manual legacy smoke (optional)

After a **coherent** local install that includes `@0gfoundation/0g-storage-ts-sdk` (for example on a throwaway branch or after verifying `node_modules` still contains Hardhat), you can run [test/zeroGStorageSdkCompatibility.test.ts](../test/zeroGStorageSdkCompatibility.test.ts) with `GCTL_ZEROG_SDK_MANUAL_SMOKE=1` — see [zerog-storage-operators.md](./zerog-storage-operators.md).

## See also

- [workspace-isolation.md](./workspace-isolation.md) — optional future split of Hardhat vs agent/0G runtime installs.
