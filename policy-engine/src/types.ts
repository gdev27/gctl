export const SUPPORTED_POLICY_SCHEMA_VERSIONS = ["1.0.0"] as const;
export type SupportedPolicySchemaVersion = (typeof SUPPORTED_POLICY_SCHEMA_VERSIONS)[number];

export type Policy = {
  id: string;
  version: string;
  schema_version: SupportedPolicySchemaVersion;
  jurisdiction: string;
  regulation: string;
  assets: {
    base: string;
    settle_tokens: string[];
  };
  privacy: {
    large_trade_threshold: number;
    large_trade_route: "public" | "shielded" | "private-mempool";
  };
  routing: {
    routing_threshold: number;
    small_trade_route: "cowswap" | "uniswap-v4";
    large_trade_route: "flashbots" | "private-mempool";
    allowed_dexes: string[];
  };
  limits: {
    max_trade_value: number;
    max_daily_notional: number;
    max_single_trade: number;
  };
  reporting: {
    enabled: boolean;
    regulator_endpoint: string;
    report_on: ("large_trades" | "limits_breached")[];
    fields: string[];
  };
  controls: {
    kill_switch_enabled: boolean;
  };
};

export type PolicyNode =
  | { type: "asset_whitelist"; allowedAssets: string[] }
  | {
      type: "trade_limits";
      maxTradeValue: number;
      maxSingleTrade: number;
      maxDailyNotional: number;
    }
  | {
      type: "privacy_router";
      largeTradeThreshold: number;
      largeRoute: "public" | "shielded" | "private-mempool";
    }
  | {
      type: "dex_and_route";
      routingThreshold: number;
      smallRoute: string;
      largeRoute: string;
      allowedDexes: string[];
    }
  | { type: "reporting"; enabled: boolean; endpoint: string; reportOn: string[]; fields: string[] }
  | { type: "controls"; killSwitchEnabled: boolean };

export type PolicyGraph = {
  id: string;
  version: string;
  schemaVersion: SupportedPolicySchemaVersion;
  compilerVersion: string;
  compiledAt: string;
  nodes: PolicyNode[];
};

export type ActionRequest = {
  actionType: "swap";
  assetIn: string;
  assetOut: string;
  amount: number;
  timestamp?: string;
  clientId?: string;
};

export type PlanDenyReason =
  | "asset_not_whitelisted"
  | "limits_exceeded"
  | "daily_notional_exceeded"
  | "kill_switch_active"
  | "dependency_failure";

export type PolicyDecisionTrace = {
  steps: Array<{ check: string; passed: boolean; detail?: string }>;
};

export type ExecutionPlan = {
  allowed: boolean;
  reason?: PlanDenyReason;
  route?: "public" | "shielded" | "private-mempool";
  dex?: string;
  pathType?: "batch-auction" | "direct-swap";
  shouldReport?: boolean;
  reportEndpoint?: string;
  killSwitchActive?: boolean;
  errorCode?: string;
  trace?: PolicyDecisionTrace;
};
