import * as dotenv from "dotenv";
import { runPolicyAndWorkflow } from "../keeperhub-workflows/src/runDemo";

dotenv.config();

async function main() {
  const demoTimestamp = process.env.DEMO_TIMESTAMP || "2026-01-01T00:00:00.000Z";
  const result = await runPolicyAndWorkflow({
    fundEnsName: process.env.FUND_ENS_NAME || "eurofund.eth",
    callerEnsName: process.env.AGENT_ENS_NAME || "algo1.eurofund.eth",
    action: {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount: 10000,
      timestamp: demoTimestamp
    }
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
