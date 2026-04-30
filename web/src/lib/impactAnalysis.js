// Replays historical transactions against a draft policy to show impact.
// Pure, deterministic, client-side.

const num = (v) => (v === "" || v == null ? null : Number(v));

function checkOne(tx, policy) {
  const reasons = [];

  if (Array.isArray(policy.allowed_chains) && policy.allowed_chains.length > 0) {
    if (tx.chain && !policy.allowed_chains.includes(tx.chain)) {
      reasons.push({ rule: "chain_allowlist", detail: `${tx.chain} not in allowlist` });
    }
  }

  if (Array.isArray(policy.allowed_tokens) && policy.allowed_tokens.length > 0) {
    if (tx.token_symbol && !policy.allowed_tokens.includes(tx.token_symbol)) {
      reasons.push({ rule: "token_allowlist", detail: `${tx.token_symbol} not in allowlist` });
    }
  }

  if (Array.isArray(policy.allowed_contracts) && policy.allowed_contracts.length > 0) {
    if (tx.to_address && !policy.allowed_contracts.includes(tx.to_address)) {
      reasons.push({ rule: "contract_allowlist", detail: "destination not allowlisted" });
    }
  }

  const maxTx = num(policy.max_tx_value_usd);
  if (maxTx != null && tx.value_usd > maxTx) {
    reasons.push({ rule: "max_tx_value", detail: `$${tx.value_usd} > cap $${maxTx}` });
  }

  const approvalAt = num(policy.require_human_approval_above_usd);
  const wouldRequireApproval = approvalAt != null && tx.value_usd > approvalAt;

  return {
    blocked: reasons.length > 0,
    wouldRequireApproval: wouldRequireApproval && reasons.length === 0,
    reasons,
  };
}

export function analyzeImpact(transactions, policy) {
  // Only count successfully executed (or formerly successful) transactions
  // for a fair comparison. Already-blocked ones are noise.
  const executed = transactions.filter((t) => t.status === "success" || t.status === "pending");

  const dailyCap = num(policy.daily_spend_limit_usd);
  // Group by day to detect daily-cap overflows
  const byDay = {};
  for (const t of executed) {
    const d = (t.executed_at || t.created_date || "").slice(0, 10);
    if (!d) continue;
    (byDay[d] ||= []).push(t);
  }

  const results = [];
  let blocked = 0;
  let approvalRequired = 0;
  let valueBlocked = 0;
  const ruleHits = {};
  const chainBreakdown = {};

  for (const day of Object.keys(byDay)) {
    // Sort within day by time so the cap consumes earliest first
    const txs = [...byDay[day]].sort((a, b) =>
      (a.executed_at || a.created_date || "").localeCompare(b.executed_at || b.created_date || "")
    );
    let consumed = 0;
    for (const tx of txs) {
      const r = checkOne(tx, policy);
      if (!r.blocked && dailyCap != null) {
        if (consumed + (tx.value_usd || 0) > dailyCap) {
          r.blocked = true;
          r.reasons.push({ rule: "daily_spend_limit", detail: `would exceed $${dailyCap}/day` });
        } else {
          consumed += tx.value_usd || 0;
        }
      }
      if (r.blocked) {
        blocked += 1;
        valueBlocked += tx.value_usd || 0;
        for (const reason of r.reasons) {
          ruleHits[reason.rule] = (ruleHits[reason.rule] || 0) + 1;
        }
      } else if (r.wouldRequireApproval) {
        approvalRequired += 1;
      }
      chainBreakdown[tx.chain || "unknown"] ||= { total: 0, blocked: 0 };
      chainBreakdown[tx.chain || "unknown"].total += 1;
      if (r.blocked) chainBreakdown[tx.chain || "unknown"].blocked += 1;
      results.push({ tx, ...r });
    }
  }

  return {
    total: executed.length,
    blocked,
    approvalRequired,
    allowed: executed.length - blocked - approvalRequired,
    valueBlocked,
    blockedRate: executed.length ? blocked / executed.length : 0,
    ruleHits,
    chainBreakdown,
    results,
  };
}

export const ruleLabel = {
  chain_allowlist: "Chain not allowlisted",
  token_allowlist: "Token not allowlisted",
  contract_allowlist: "Contract not allowlisted",
  max_tx_value: "Per-tx cap",
  daily_spend_limit: "Daily limit",
};