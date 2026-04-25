import { ActionRequest, ExecutionPlan, PolicyDecisionTrace, PolicyGraph, PolicyNode } from "./types";

const dailyNotional: Map<string, number> = new Map();

function getNode<T extends PolicyNode["type"]>(graph: PolicyGraph, type: T): Extract<PolicyNode, { type: T }> {
  const node = graph.nodes.find((candidate) => candidate.type === type);
  if (!node) {
    throw new Error(`Missing node type ${type}`);
  }
  return node as Extract<PolicyNode, { type: T }>;
}

function dayKey(request: ActionRequest): string {
  const date = request.timestamp ? new Date(request.timestamp) : new Date();
  return date.toISOString().slice(0, 10);
}

export function resetDailyNotionalState(): void {
  dailyNotional.clear();
}

export function evaluatePolicy(graph: PolicyGraph, request: ActionRequest): ExecutionPlan {
  const trace: PolicyDecisionTrace = { steps: [] };

  const controls = getNode(graph, "controls");
  if (controls.killSwitchEnabled) {
    trace.steps.push({ check: "controls.kill_switch", passed: false, detail: "kill_switch_enabled" });
    return {
      allowed: false,
      reason: "kill_switch_active",
      killSwitchActive: true,
      trace
    };
  }
  trace.steps.push({ check: "controls.kill_switch", passed: true });

  const whitelist = getNode(graph, "asset_whitelist");
  const assetsAllowed = whitelist.allowedAssets.includes(request.assetIn) && whitelist.allowedAssets.includes(request.assetOut);
  if (!assetsAllowed) {
    trace.steps.push({ check: "assets.whitelist", passed: false, detail: `${request.assetIn}->${request.assetOut}` });
    return {
      allowed: false,
      reason: "asset_not_whitelisted",
      killSwitchActive: false,
      trace
    };
  }
  trace.steps.push({ check: "assets.whitelist", passed: true });

  const limits = getNode(graph, "trade_limits");
  if (request.amount > limits.maxTradeValue || request.amount > limits.maxSingleTrade) {
    trace.steps.push({ check: "limits.single", passed: false, detail: `${request.amount}` });
    return {
      allowed: false,
      reason: "limits_exceeded",
      killSwitchActive: false,
      shouldReport: true,
      trace
    };
  }
  trace.steps.push({ check: "limits.single", passed: true });

  const notionalKey = `${graph.id}:${dayKey(request)}`;
  const currentNotional = dailyNotional.get(notionalKey) || 0;
  if (currentNotional + request.amount > limits.maxDailyNotional) {
    trace.steps.push({ check: "limits.daily", passed: false, detail: `${currentNotional + request.amount}` });
    return {
      allowed: false,
      reason: "daily_notional_exceeded",
      killSwitchActive: false,
      shouldReport: true,
      trace
    };
  }
  dailyNotional.set(notionalKey, currentNotional + request.amount);
  trace.steps.push({ check: "limits.daily", passed: true });

  const privacy = getNode(graph, "privacy_router");
  const routing = getNode(graph, "dex_and_route");
  const reporting = getNode(graph, "reporting");

  const largeTrade = request.amount >= privacy.largeTradeThreshold;
  const route = largeTrade ? privacy.largeRoute : "public";
  const pathType = request.amount < routing.routingThreshold ? "batch-auction" : "direct-swap";
  const dex = pathType === "batch-auction" ? "COWSWAP" : routing.allowedDexes[0] || "UNKNOWN";
  const shouldReport = reporting.enabled && largeTrade && reporting.reportOn.includes("large_trades");

  trace.steps.push({ check: "routing.path", passed: true, detail: `${pathType}:${dex}` });
  trace.steps.push({ check: "privacy.route", passed: true, detail: route });
  trace.steps.push({ check: "reporting", passed: true, detail: `${shouldReport}` });

  return {
    allowed: true,
    route,
    dex,
    pathType,
    shouldReport,
    reportEndpoint: shouldReport ? reporting.endpoint : undefined,
    killSwitchActive: false,
    trace
  };
}
