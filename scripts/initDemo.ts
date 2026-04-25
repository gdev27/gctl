import fs from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { loadAndValidatePolicy } from "../dsl/src/validate";
import { buildPolicyId, compilePolicy, hashPolicyGraph } from "../policy-engine/src/compiler";
import { buildStorageAdapter } from "../policy-engine/src/storageAdapter";
import { indexPolicyRegistered } from "../indexer/src/policyRegistry";

dotenv.config();

const registryAbi = [
  "function registerPolicy(bytes32 policyId, bytes32 hash, string calldata uri) external"
];

async function main() {
  const policyPath = "dsl/samples/eurofund.mica.yaml";
  const configPath = path.resolve("ens-identity/config/agents.json");
  const rpc = process.env.BASE_SEPOLIA_RPC_URL;
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  const registryAddress = process.env.POLICY_REGISTRY_ADDRESS;
  if (!rpc || !key || !registryAddress) {
    throw new Error("BASE_SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, POLICY_REGISTRY_ADDRESS are required");
  }

  const policy = await loadAndValidatePolicy(policyPath);
  const graph = compilePolicy(policy);
  const policyId = buildPolicyId(policy);
  const hash = hashPolicyGraph(graph);
  const storage = buildStorageAdapter();
  const { uri } = await storage.saveGraph(policyId, graph);

  const signer = new ethers.Wallet(key, new ethers.JsonRpcProvider(rpc));
  const registry = new ethers.Contract(registryAddress, registryAbi, signer);
  const tx = await registry.registerPolicy(policyId, hash, uri);
  const receipt = await tx.wait();
  await indexPolicyRegistered({
    policyId,
    hash,
    uri,
    active: true,
    updatedAt: Date.now()
  });

  const configRaw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(configRaw) as Record<string, unknown>;
  const updated = {
    ...config,
    policyId,
    policyRegistryAddress: registryAddress,
    policyRegistryChainId: Number(process.env.POLICY_REGISTRY_CHAIN_ID || 84532),
    executionProfile: process.env.ENS_EXECUTION_PROFILE || "standard"
  };
  await fs.writeFile(configPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        fundEnsName: process.env.FUND_ENS_NAME || "eurofund.eth",
        agentEnsName: process.env.AGENT_ENS_NAME || "algo1.eurofund.eth",
        policyId,
        hash,
        uri,
        registryAddress,
        txHash: receipt?.hash
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
