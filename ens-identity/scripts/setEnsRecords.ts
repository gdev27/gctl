import fs from "node:fs/promises";
import path from "node:path";
import { Contract, JsonRpcProvider, Wallet, namehash } from "ethers";

const resolverAbi = [
  "function setText(bytes32 node, string key, string value) external",
  "function text(bytes32 node, string key) view returns (string)"
];

type AgentConfig = {
  fundEnsName: string;
  agentEnsName: string;
  policyId: string;
  policyRegistryAddress: string;
  policyRegistryChainId: number;
  executionProfile?: "standard" | "private-only";
  agentRegistryAddress: string;
  agentId: string;
};

async function setText(
  resolverAddress: string,
  signer: Wallet,
  ensName: string,
  key: string,
  value: string
): Promise<void> {
  const resolver = new Contract(resolverAddress, resolverAbi, signer);
  const tx = await resolver.setText(namehash(ensName), key, value);
  await tx.wait();
}

async function main() {
  const configPath = path.resolve("ens-identity/config/agents.json");
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw) as AgentConfig;

  const rpcUrl = process.env.ENS_MAINNET_RPC_URL || process.env.MAINNET_RPC_URL;
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  const fundResolverAddress = process.env.FUND_ENS_RESOLVER_ADDRESS;
  const agentResolverAddress = process.env.AGENT_ENS_RESOLVER_ADDRESS || fundResolverAddress;

  if (!rpcUrl || !key || !fundResolverAddress || !agentResolverAddress) {
    throw new Error("Missing ENS RPC, private key, or resolver addresses.");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(key, provider);

  await setText(fundResolverAddress, signer, config.fundEnsName, "policy-id", config.policyId);
  await setText(
    fundResolverAddress,
    signer,
    config.fundEnsName,
    "policy-registry",
    config.policyRegistryAddress
  );
  await setText(
    fundResolverAddress,
    signer,
    config.fundEnsName,
    "policy-registry-chain-id",
    String(config.policyRegistryChainId)
  );
  await setText(
    fundResolverAddress,
    signer,
    config.fundEnsName,
    "execution-profile",
    config.executionProfile || "standard"
  );
  await setText(
    agentResolverAddress,
    signer,
    config.agentEnsName,
    `agent-registration[${config.agentRegistryAddress || "erc8004"}][agentId]`,
    config.agentId
  );

  console.log(
    JSON.stringify(
      {
        fundEnsName: config.fundEnsName,
        agentEnsName: config.agentEnsName,
        policyId: config.policyId
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
