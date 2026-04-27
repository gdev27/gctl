import * as dotenv from "dotenv";
import { ActionRequest } from "../../policy-engine/src/types";
import { MainnetEnsResolver } from "../src/ensResolver";
import { ZeroGComputeAdapter, ZeroGMemoryAdapter } from "../src/zeroG";
import { runPolicyAndWorkflow } from "../../keeperhub-workflows/src/runDemo";
import { JsonRpcProvider } from "ethers";

dotenv.config();

type SwarmObjective = {
  fundEnsName: string;
  executorEnsName: string;
  objective: string;
  action: ActionRequest;
};

async function runTreasuryTwinSwarm(input: SwarmObjective): Promise<Record<string, unknown>> {
  const compute = new ZeroGComputeAdapter();
  const memory = new ZeroGMemoryAdapter();
  const provider = new JsonRpcProvider(process.env.ENS_MAINNET_RPC_URL || process.env.MAINNET_RPC_URL || "");
  const ens = new MainnetEnsResolver(provider, process.env.ERC8004_REGISTRY_ADDRESS);

  const planner = await compute.infer({
    role: "planner",
    objective: `Create policy-compliant plan for: ${input.objective}`,
    context: { action: input.action, fundEnsName: input.fundEnsName }
  });

  const researcher = await compute.infer({
    role: "researcher",
    objective: "Add market and liquidity context for proposed action",
    context: { draftPlan: planner.output, action: input.action }
  });

  const critic = await compute.infer({
    role: "critic",
    objective: "Challenge the plan and flag policy or execution risks",
    context: { draftPlan: planner.output, research: researcher.output, amount: input.action.amount }
  });

  await memory.write({
    namespace: "swarm-shared",
    key: "latest",
    encrypted: true,
    createdAt: new Date().toISOString(),
    payload: {
      objective: input.objective,
      planner: planner.output,
      researcher: researcher.output,
      critic: critic.output
    }
  });

  const passport = await ens.resolveIdentityPassport(input.executorEnsName);
  if (!passport.verifiedReverse) {
    return {
      allowed: false,
      reason: "reverse_resolution_not_verified",
      passport
    };
  }

  const criticRejected = /reject|deny|block/i.test(critic.output) || input.action.amount > 900_000;
  if (criticRejected) {
    return {
      allowed: false,
      reason: "critic_rejected_plan",
      traces: { planner, researcher, critic },
      passport
    };
  }

  const execution = await runPolicyAndWorkflow({
    fundEnsName: input.fundEnsName,
    callerEnsName: input.executorEnsName,
    action: input.action
  });

  return {
    allowed: true,
    objective: input.objective,
    passport,
    traces: { planner, researcher, critic },
    execution
  };
}

async function main() {
  const result = await runTreasuryTwinSwarm({
    fundEnsName: process.env.FUND_ENS_NAME || "eurofund.eth",
    executorEnsName: process.env.AGENT_ENS_NAME || "executor.eurofund.eth",
    objective: "Rebalance treasury into compliant risk-adjusted position",
    action: {
      actionType: "swap",
      assetIn: "USDC",
      assetOut: "EURRWA",
      amount: Number(process.env.SWARM_DEMO_AMOUNT || 125000),
      timestamp: process.env.DEMO_TIMESTAMP || new Date().toISOString()
    }
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

