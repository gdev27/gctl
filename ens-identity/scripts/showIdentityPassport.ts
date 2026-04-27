import * as dotenv from "dotenv";
import { JsonRpcProvider } from "ethers";
import { MainnetEnsResolver } from "../../agent-sdk/src/ensResolver";

dotenv.config();

async function main() {
  const ensName = process.argv[2] || process.env.AGENT_ENS_NAME || "executor.eurofund.eth";
  const rpcUrl = process.env.ENS_MAINNET_RPC_URL || process.env.MAINNET_RPC_URL;
  if (!rpcUrl) {
    throw new Error("Missing ENS_MAINNET_RPC_URL or MAINNET_RPC_URL.");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const resolver = new MainnetEnsResolver(provider, process.env.ERC8004_REGISTRY_ADDRESS);
  const passport = await resolver.resolveIdentityPassport(ensName);
  const authorized = await resolver.verifyAgentAuthorization(ensName);

  console.log(
    JSON.stringify(
      {
        ensName,
        authorized,
        passport
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

