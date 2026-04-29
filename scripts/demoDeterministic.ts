import * as dotenv from "dotenv";
import { runPolicyAndWorkflow } from "../keeperhub-workflows/src/runDemo";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for deterministic demo execution`);
  }
  return value;
}

async function run(amount: number) {
  return runPolicyAndWorkflow({
    fundEnsName: requireEnv("FUND_ENS_NAME"),
    callerEnsName: requireEnv("AGENT_ENS_NAME"),
    action: {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount,
      timestamp: process.env.DEMO_TIMESTAMP || "2026-01-01T00:00:00.000Z"
    }
  });
}

async function main() {
  const small = await run(10000);
  const large = await run(250000);
  console.log(
    JSON.stringify(
      {
        mode: "deterministic-demo",
        timestamp: process.env.DEMO_TIMESTAMP || "2026-01-01T00:00:00.000Z",
        small,
        large
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
