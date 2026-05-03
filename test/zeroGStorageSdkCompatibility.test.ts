import { describe, expect, it } from "vitest";

/**
 * Manual / throwaway-branch check: loads the official SDK next to root `ethers` ^6.16.
 * Do not use `npm install … --legacy-peer-deps --no-save` on your main dev tree — npm can
 * prune unrelated packages. Prefer [integrations/zerog-sdk-isolated/](../integrations/zerog-sdk-isolated/) for CI.
 *
 *   GCTL_ZEROG_SDK_MANUAL_SMOKE=1 npm run test:zerog-sdk-legacy-smoke
 */
describe.skipIf(process.env.GCTL_ZEROG_SDK_MANUAL_SMOKE !== "1")("0G storage SDK beside root ethers (manual)", () => {
  it("loads the official package (same specifier as zeroG.ts)", async () => {
    const mod = await import("@0gfoundation/0g-storage-ts-sdk");
    expect(mod).toBeTruthy();
    expect(typeof mod.Indexer).toBe("function");
  });
});
