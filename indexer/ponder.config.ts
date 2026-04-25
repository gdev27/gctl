export default {
  project: "institutional-policy-os-indexer",
  // MVP scaffold: replace with actual chain and contract bindings during deployment.
  contracts: {
    PolicyRegistry: {
      abiPath: "../artifacts/contracts/PolicyRegistry.sol/PolicyRegistry.json",
      network: Number(process.env.POLICY_REGISTRY_CHAIN_ID || 84532),
      address: process.env.POLICY_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
      startBlock: Number(process.env.POLICY_REGISTRY_START_BLOCK || 0)
    }
  }
};
