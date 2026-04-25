import { keccak256, toUtf8Bytes } from "ethers";
import { Policy, PolicyGraph, PolicyNode } from "./types";

export const POLICY_COMPILER_VERSION = "1.0.0";

export function buildPolicyId(policy: Pick<Policy, "id" | "version">): string {
  return keccak256(toUtf8Bytes(`${policy.id}:${policy.version}`));
}

export function compilePolicy(policy: Policy): PolicyGraph {
  const nodes: PolicyNode[] = [
    {
      type: "asset_whitelist",
      allowedAssets: [policy.assets.base, ...policy.assets.settle_tokens]
    },
    {
      type: "trade_limits",
      maxTradeValue: policy.limits.max_trade_value,
      maxSingleTrade: policy.limits.max_single_trade,
      maxDailyNotional: policy.limits.max_daily_notional
    },
    {
      type: "privacy_router",
      largeTradeThreshold: policy.privacy.large_trade_threshold,
      largeRoute: policy.privacy.large_trade_route
    },
    {
      type: "dex_and_route",
      routingThreshold: policy.routing.routing_threshold,
      smallRoute: policy.routing.small_trade_route,
      largeRoute: policy.routing.large_trade_route,
      allowedDexes: policy.routing.allowed_dexes
    },
    {
      type: "reporting",
      enabled: policy.reporting.enabled,
      endpoint: policy.reporting.regulator_endpoint,
      reportOn: policy.reporting.report_on,
      fields: policy.reporting.fields
    },
    {
      type: "controls",
      killSwitchEnabled: policy.controls.kill_switch_enabled
    }
  ];

  return {
    id: policy.id,
    version: policy.version,
    schemaVersion: policy.schema_version,
    compilerVersion: POLICY_COMPILER_VERSION,
    compiledAt: new Date().toISOString(),
    nodes
  };
}

export function canonicalizeGraph(graph: PolicyGraph): string {
  const normalized: PolicyGraph = {
    ...graph,
    // Exclude volatile timestamps from the canonical hash input.
    compiledAt: "canonical"
  };
  return JSON.stringify(normalized);
}

export function hashPolicyGraph(graph: PolicyGraph): string {
  return keccak256(toUtf8Bytes(canonicalizeGraph(graph)));
}
