// Built-in, community-vetted policy patterns. Apply one to bootstrap a new policy.

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All", icon: "Layers" },
  { id: "treasury", label: "Treasury", icon: "Wallet" },
  { id: "yield", label: "Yield", icon: "TrendingUp" },
  { id: "payments", label: "Payments", icon: "Send" },
  { id: "trading", label: "Trading", icon: "ArrowLeftRight" },
  { id: "experimental", label: "Experimental", icon: "FlaskConical" },
  { id: "observation", label: "Observation", icon: "Eye" },
  { id: "custom", label: "Custom", icon: "Sparkles" },
];

export const POLICY_TEMPLATES = [
  {
    id: "conservative-spending",
    name: "Conservative Spending",
    tagline: "Tight caps, single-chain, USDC only.",
    description:
      "The safest starting point. Small per-tx limit, modest daily cap, and human approval on anything non-trivial. Ideal for first-time deployments and treasury operations.",
    category: "treasury",
    tags: ["safe", "starter", "usdc"],
    badge: "Most popular",
    accent: "primary",
    config: {
      name: "Conservative Spending",
      description: "Tight per-tx and daily limits with low approval threshold.",
      max_tx_value_usd: 250,
      daily_spend_limit_usd: 1000,
      allowed_chains: ["base"],
      allowed_tokens: ["USDC"],
      allowed_contracts: [],
      require_human_approval_above_usd: 500,
      is_active: true,
    },
  },
  {
    id: "authorized-signer-only",
    name: "Authorized Signer Only",
    tagline: "Allowlist of recipients, no surprises.",
    description:
      "The agent can only send to a fixed list of addresses. Perfect for payroll, vendor disbursement, or treasury sweeps to known wallets.",
    category: "payments",
    tags: ["allowlist", "payroll", "vendors"],
    accent: "chart-2",
    config: {
      name: "Authorized Signer Only",
      description: "Restricts transactions to a pre-approved recipient allowlist.",
      max_tx_value_usd: 5000,
      daily_spend_limit_usd: 25000,
      allowed_chains: ["base", "ethereum"],
      allowed_tokens: ["USDC", "USDT"],
      allowed_contracts: [],
      require_human_approval_above_usd: 2500,
      is_active: true,
    },
  },
  {
    id: "daily-rotation-limit",
    name: "Daily Rotation Limit",
    tagline: "High frequency, hard daily ceiling.",
    description:
      "Allows many small transactions but enforces a strict daily cumulative cap. Designed for market makers, rebalancers, and high-frequency yield routers.",
    category: "trading",
    tags: ["high-frequency", "rebalancer", "mm"],
    accent: "chart-3",
    config: {
      name: "Daily Rotation Limit",
      description: "Optimized for high-frequency operations with cumulative daily ceiling.",
      max_tx_value_usd: 1000,
      daily_spend_limit_usd: 10000,
      allowed_chains: ["base", "arbitrum", "optimism"],
      allowed_tokens: ["USDC", "ETH", "WETH"],
      allowed_contracts: [],
      require_human_approval_above_usd: 5000,
      is_active: true,
    },
  },
  {
    id: "multichain-yield",
    name: "Multichain Yield Router",
    tagline: "Move stables across L2s for best APY.",
    description:
      "Generous limits across major L2s and bridges. Constrained to stables. Used by yield-routing agents that hunt risk-adjusted returns.",
    category: "yield",
    tags: ["stables", "multi-l2", "apy"],
    accent: "chart-4",
    config: {
      name: "Multichain Yield Router",
      description: "Stables-only, multi-L2, generous daily cap for yield optimization.",
      max_tx_value_usd: 10000,
      daily_spend_limit_usd: 50000,
      allowed_chains: ["base", "arbitrum", "optimism", "polygon"],
      allowed_tokens: ["USDC", "USDT", "DAI"],
      allowed_contracts: [],
      require_human_approval_above_usd: 15000,
      is_active: true,
    },
  },
  {
    id: "sandbox",
    name: "Sandbox",
    tagline: "Tiny limits for first-run experiments.",
    description:
      "$50 per tx, $200/day, single chain. The right place to test a new agent objective before turning up the dials.",
    category: "experimental",
    tags: ["test", "sandbox", "small"],
    accent: "chart-5",
    config: {
      name: "Sandbox",
      description: "Minimal limits for safe experimentation with new agents.",
      max_tx_value_usd: 50,
      daily_spend_limit_usd: 200,
      allowed_chains: ["base"],
      allowed_tokens: ["USDC"],
      allowed_contracts: [],
      require_human_approval_above_usd: 100,
      is_active: true,
    },
  },
  {
    id: "read-only-observer",
    name: "Read-Only Observer",
    tagline: "Zero spend. Pure observation.",
    description:
      "No transactions allowed. Useful when you want an agent to monitor and reason about onchain state without ever moving value. Pair with alerting.",
    category: "observation",
    tags: ["readonly", "monitoring", "alerts"],
    accent: "muted",
    config: {
      name: "Read-Only Observer",
      description: "Hard zero on spending. Observation-only mode.",
      max_tx_value_usd: 0,
      daily_spend_limit_usd: 0,
      allowed_chains: [],
      allowed_tokens: [],
      allowed_contracts: [],
      require_human_approval_above_usd: 0,
      is_active: true,
    },
  },
];

export function categoryAccent(category) {
  const map = {
    treasury: "primary",
    yield: "chart-4",
    payments: "chart-2",
    trading: "chart-3",
    experimental: "chart-5",
    observation: "muted",
    custom: "chart-3",
  };
  return map[category] || "primary";
}