/**
 * Verifies the official 0G storage SDK loads with ethers@6.13.1 (satisfies published peers).
 * Run from this directory after `npm install`: `node smoke.mjs`
 */
const sdk = await import("@0gfoundation/0g-storage-ts-sdk");
if (!sdk || typeof sdk.Indexer !== "function") {
  console.error("expected Indexer export from @0gfoundation/0g-storage-ts-sdk");
  process.exit(1);
}
if (typeof sdk.ZgFile?.fromFilePath !== "function") {
  console.error("expected ZgFile.fromFilePath from @0gfoundation/0g-storage-ts-sdk");
  process.exit(1);
}
console.log("ok: @0gfoundation/0g-storage-ts-sdk loads with ethers@6.13.1 (isolated tree)");
