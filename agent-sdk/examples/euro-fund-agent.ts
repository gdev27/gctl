import * as dotenv from "dotenv";
import { runPolicyAndWorkflow } from "../../keeperhub-workflows/src/runDemo";

dotenv.config();

async function main() {
  const amount = Number(process.argv[2] || "10000");
  const fundEnsName = process.env.FUND_ENS_NAME || "eurofund.eth";
  const callerEnsName = process.env.AGENT_ENS_NAME || "algo1.eurofund.eth";
  const assetIn = process.argv[3] || "EURC";
  const assetOut = process.argv[4] || "EURRWA";

  const result = await runPolicyAndWorkflow({
    fundEnsName,
    callerEnsName,
    action: {
      actionType: "swap",
      amount,
      assetIn,
      assetOut,
      timestamp: new Date().toISOString()
    }
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
