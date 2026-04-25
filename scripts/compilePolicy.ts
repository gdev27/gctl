import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { loadAndValidatePolicy } from "../dsl/src/validate";
import { buildPolicyId, compilePolicy } from "../policy-engine/src/compiler";
import { buildStorageAdapter } from "../policy-engine/src/storageAdapter";
import { indexPolicyRegistered } from "../indexer/src/policyRegistry";

dotenv.config();

async function main() {
  const policyPath = process.argv[2] || "dsl/samples/eurofund.mica.yaml";
  const registryAddress = process.env.POLICY_REGISTRY_ADDRESS;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const signerKey = process.env.DEPLOYER_PRIVATE_KEY;

  const policy = await loadAndValidatePolicy(policyPath);
  const graph = compilePolicy(policy);
  const policyId = buildPolicyId(policy);

  const storage = buildStorageAdapter();
  const { uri, hash } = await storage.saveGraph(policyId, graph);

  let txHash = "not_submitted";
  let active = true;
  if (registryAddress && rpcUrl && signerKey) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(signerKey, provider);
    const abi = [
      "function registerPolicy(bytes32 policyId, bytes32 hash, string calldata uri) external"
    ];
    const registry = new ethers.Contract(registryAddress, abi, signer);
    const tx = await registry.registerPolicy(policyId, hash, uri);
    const receipt = await tx.wait();
    txHash = receipt?.hash || tx.hash;
  }

  await indexPolicyRegistered({
    policyId,
    hash,
    uri,
    active,
    updatedAt: Date.now()
  });

  console.log(
    JSON.stringify(
      {
        policyPath,
        policyId,
        hash,
        uri,
        txHash
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
