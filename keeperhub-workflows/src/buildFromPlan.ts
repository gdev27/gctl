import { randomUUID } from "node:crypto";
import { ActionRequest, ExecutionPlan } from "../../policy-engine/src/types";

export type WorkflowStep = {
  type: string;
  params: Record<string, unknown>;
};

export type KeeperHubWorkflow = {
  name: string;
  steps: WorkflowStep[];
  metadata: Record<string, unknown>;
};

export function buildWorkflowFromPlan(
  plan: ExecutionPlan,
  context: { policyId: string; action: ActionRequest }
): KeeperHubWorkflow {
  if (!plan.allowed) {
    throw new Error(`Action not allowed: ${plan.reason || "unknown_reason"}`);
  }

  const baseMetadata = {
    workflowRef: randomUUID(),
    policyId: context.policyId,
    route: plan.route,
    pathType: plan.pathType,
    policyPath: plan.pathType === "batch-auction" ? "safe-path" : "escalated-path"
  };

  if (plan.pathType === "batch-auction") {
    return {
      name: "safe-path-small-trade",
      metadata: baseMetadata,
      steps: [
        {
          type: "cowswap_intent",
          params: {
            assetIn: context.action.assetIn,
            assetOut: context.action.assetOut,
            amount: context.action.amount
          }
        }
      ]
    };
  }

  const steps: WorkflowStep[] = [
    {
      type: "flashbots_bundle",
      params: {
        assetIn: context.action.assetIn,
        assetOut: context.action.assetOut,
        amount: context.action.amount,
        targetContract: plan.dex || "PRIVATE_ROUTER"
      }
    }
  ];

  if (plan.shouldReport && plan.reportEndpoint) {
    steps.push({
      type: "http_post",
      params: {
        url: plan.reportEndpoint,
        body: {
          assetIn: context.action.assetIn,
          assetOut: context.action.assetOut,
          amount: context.action.amount,
          policyId: context.policyId,
          timestamp: context.action.timestamp || new Date().toISOString()
        }
      }
    });
  }

  return {
    name: "escalated-path-large-trade",
    metadata: baseMetadata,
    steps
  };
}
