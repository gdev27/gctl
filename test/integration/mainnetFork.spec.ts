import { describe, expect, it } from "vitest";
import { JsonRpcProvider } from "ethers";

const maybeMainnetRpc = process.env.MAINNET_RPC_URL;

describe("mainnet fork integration harness", () => {
  it.skipIf(!maybeMainnetRpc)("connects to mainnet rpc for ENS-dependent tests", async () => {
    const provider = new JsonRpcProvider(maybeMainnetRpc);
    const block = await provider.getBlockNumber();
    expect(block).toBeGreaterThan(0);
  });
});
