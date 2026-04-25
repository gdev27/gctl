import fs from "node:fs/promises";
import path from "node:path";

type AgentConfig = {
  fundEnsName: string;
  agentEnsName: string;
  policyId: string;
  policyRegistryAddress: string;
  policyRegistryChainId: number;
  agentRegistryAddress: string;
  agentId: string;
};

async function main() {
  const configPath = path.resolve("ens-identity/config/agents.json");
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw) as AgentConfig;

  // MVP stub: in production, mint/register in ERC-8004 registry and return identifier.
  const assignedAgentId = process.env.AGENT_ID || config.agentId || "1";

  const updated: AgentConfig = {
    ...config,
    agentId: assignedAgentId
  };
  await fs.writeFile(configPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ assignedAgentId, configPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
