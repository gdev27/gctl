import { describe, expect, it } from "vitest";
import { buildWorkflowFromPlan } from "../keeperhub-workflows/src/buildFromPlan";

describe("KeeperHub workflow branching", () => {
  it("maps batch-auction plan into safe path", () => {
    const workflow = buildWorkflowFromPlan(
      {
        allowed: true,
        pathType: "batch-auction",
        route: "public"
      },
      {
        policyId: "policy-1",
        action: {
          actionType: "swap",
          assetIn: "USDC",
          assetOut: "EURRWA",
          amount: 10_000
        }
      }
    );

    expect(workflow.name).toBe("safe-path-small-trade");
    expect(workflow.metadata.policyPath).toBe("safe-path");
  });

  it("maps direct-swap plan into escalated path", () => {
    const workflow = buildWorkflowFromPlan(
      {
        allowed: true,
        pathType: "direct-swap",
        route: "private-mempool",
        shouldReport: true,
        reportEndpoint: "https://example.com/report"
      },
      {
        policyId: "policy-1",
        action: {
          actionType: "swap",
          assetIn: "USDC",
          assetOut: "EURRWA",
          amount: 210_000
        }
      }
    );

    expect(workflow.name).toBe("escalated-path-large-trade");
    expect(workflow.metadata.policyPath).toBe("escalated-path");
    expect(workflow.steps.find((step) => step.type === "http_post")).toBeTruthy();
  });
});

