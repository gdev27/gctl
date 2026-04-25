import { describe, expect, it, beforeEach } from "vitest";
import { compilePolicy } from "../src/compiler";
import { evaluatePolicy, resetDailyNotionalState } from "../src/engine";
import { Policy } from "../src/types";

const policy: Policy = {
  id: "eurofund-mica",
  version: "1.0.0",
  schema_version: "1.0.0",
  jurisdiction: "EU",
  regulation: "MiCA",
  assets: {
    base: "EURRWA",
    settle_tokens: ["EURC", "USDC"]
  },
  privacy: {
    large_trade_threshold: 100000,
    large_trade_route: "private-mempool"
  },
  routing: {
    routing_threshold: 100000,
    small_trade_route: "cowswap",
    large_trade_route: "flashbots",
    allowed_dexes: ["FLASHBOTS_ROUTER"]
  },
  limits: {
    max_trade_value: 500000,
    max_daily_notional: 150000,
    max_single_trade: 500000
  },
  reporting: {
    enabled: true,
    regulator_endpoint: "https://regulator.example/report",
    report_on: ["large_trades", "limits_breached"],
    fields: ["amount", "assetIn", "assetOut"]
  },
  controls: {
    kill_switch_enabled: false
  }
};

describe("evaluatePolicy", () => {
  beforeEach(() => {
    resetDailyNotionalState();
  });

  it("allows a small trade through public batch auction", () => {
    const graph = compilePolicy(policy);
    const plan = evaluatePolicy(graph, {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount: 10000
    });
    expect(plan.allowed).toBe(true);
    expect(plan.pathType).toBe("batch-auction");
    expect(plan.route).toBe("public");
    expect(plan.shouldReport).toBe(false);
  });

  it("routes a large trade to private path with reporting", () => {
    const graph = compilePolicy(policy);
    const plan = evaluatePolicy(graph, {
      actionType: "swap",
      assetIn: "USDC",
      assetOut: "EURRWA",
      amount: 120000
    });
    expect(plan.allowed).toBe(true);
    expect(plan.pathType).toBe("direct-swap");
    expect(plan.route).toBe("private-mempool");
    expect(plan.shouldReport).toBe(true);
  });

  it("denies non-whitelisted assets", () => {
    const graph = compilePolicy(policy);
    const plan = evaluatePolicy(graph, {
      actionType: "swap",
      assetIn: "WETH",
      assetOut: "EURRWA",
      amount: 1000
    });
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("asset_not_whitelisted");
  });

  it("denies when daily notional exceeded", () => {
    const graph = compilePolicy(policy);
    evaluatePolicy(graph, {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount: 100000,
      timestamp: "2026-01-01T00:00:00.000Z"
    });
    const plan = evaluatePolicy(graph, {
      actionType: "swap",
      assetIn: "EURC",
      assetOut: "EURRWA",
      amount: 60000,
      timestamp: "2026-01-01T12:00:00.000Z"
    });
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("daily_notional_exceeded");
  });
});
