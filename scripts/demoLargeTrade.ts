import * as dotenv from "dotenv";
import { runPolicyAndWorkflow } from "../keeperhub-workflows/src/runDemo";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for demo execution`);
  }
  return value;
}

async function main() {
  const demoTimestamp = process.env.DEMO_TIMESTAMP || "2026-01-01T00:00:00.000Z";
  const result = await runPolicyAndWorkflow({
    fundEnsName: requireEnv("FUND_ENS_NAME"),
    callerEnsName: requireEnv("AGENT_ENS_NAME"),
    action: {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount: 250000,
      timestamp: demoTimestamp
    }
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
