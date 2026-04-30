// Deterministic, client-side policy simulation — same logic the real engine uses.
// Returns an array of step results so the UI can visualize each check.

export const STEP_LABELS = {
  chain: "Chain allowlist",
  token: "Token allowlist",
  contract: "Contract allowlist",
  max_tx: "Max per-tx limit",
  daily: "Daily spend limit",
  approval: "Approval threshold",
};

export function simulatePolicy(policy, tx, dailySpentSoFar = 0) {
  const steps = [];

  // 1. Chain allowlist
  if (policy.allowed_chains && policy.allowed_chains.length > 0) {
    const ok = policy.allowed_chains.includes(tx.chain);
    steps.push({
      key: "chain",
      label: STEP_LABELS.chain,
      passed: ok,
      detail: ok
        ? `${tx.chain} is allowed`
        : `${tx.chain} is not in allowlist [${policy.allowed_chains.join(", ")}]`,
    });
    if (!ok) return finalize(steps, "chain_not_in_allowlist");
  } else {
    steps.push({ key: "chain", label: STEP_LABELS.chain, passed: true, detail: "no chain restriction" });
  }

  // 2. Token allowlist
  if (policy.allowed_tokens && policy.allowed_tokens.length > 0 && tx.token_symbol) {
    const ok = policy.allowed_tokens.some((t) => t.toLowerCase() === tx.token_symbol.toLowerCase());
    steps.push({
      key: "token",
      label: STEP_LABELS.token,
      passed: ok,
      detail: ok ? `${tx.token_symbol} is allowed` : `${tx.token_symbol} is not in allowlist`,
    });
    if (!ok) return finalize(steps, "token_not_in_allowlist");
  } else {
    steps.push({ key: "token", label: STEP_LABELS.token, passed: true, detail: "no token restriction" });
  }

  // 3. Contract allowlist
  if (policy.allowed_contracts && policy.allowed_contracts.length > 0 && tx.to_address) {
    const ok = policy.allowed_contracts.map((c) => c.toLowerCase()).includes(tx.to_address.toLowerCase());
    steps.push({
      key: "contract",
      label: STEP_LABELS.contract,
      passed: ok,
      detail: ok ? "target in allowlist" : "target contract not in allowlist",
    });
    if (!ok) return finalize(steps, "contract_not_in_allowlist");
  } else {
    steps.push({ key: "contract", label: STEP_LABELS.contract, passed: true, detail: "no contract restriction" });
  }

  // 4. Max tx
  if (policy.max_tx_value_usd) {
    const ok = tx.value_usd <= policy.max_tx_value_usd;
    steps.push({
      key: "max_tx",
      label: STEP_LABELS.max_tx,
      passed: ok,
      detail: `$${tx.value_usd.toFixed(2)} ${ok ? "≤" : ">"} $${policy.max_tx_value_usd}`,
    });
    if (!ok) return finalize(steps, "max_tx_value_exceeded");
  } else {
    steps.push({ key: "max_tx", label: STEP_LABELS.max_tx, passed: true, detail: "no per-tx cap" });
  }

  // 5. Daily limit
  if (policy.daily_spend_limit_usd) {
    const projected = dailySpentSoFar + tx.value_usd;
    const ok = projected <= policy.daily_spend_limit_usd;
    steps.push({
      key: "daily",
      label: STEP_LABELS.daily,
      passed: ok,
      detail: `projected daily $${projected.toFixed(2)} ${ok ? "≤" : ">"} $${policy.daily_spend_limit_usd}`,
    });
    if (!ok) return finalize(steps, "daily_limit_exceeded");
  } else {
    steps.push({ key: "daily", label: STEP_LABELS.daily, passed: true, detail: "no daily cap" });
  }

  // 6. Approval threshold
  if (policy.require_human_approval_above_usd && tx.value_usd > policy.require_human_approval_above_usd) {
    steps.push({
      key: "approval",
      label: STEP_LABELS.approval,
      passed: true,
      requiresApproval: true,
      detail: `$${tx.value_usd.toFixed(2)} > $${policy.require_human_approval_above_usd} → approval required`,
    });
    return { steps, status: "awaiting_approval", rule: "approval_threshold" };
  } else {
    steps.push({
      key: "approval",
      label: STEP_LABELS.approval,
      passed: true,
      detail: policy.require_human_approval_above_usd
        ? `under $${policy.require_human_approval_above_usd} threshold`
        : "no approval rule",
    });
  }

  return { steps, status: "approved", rule: null };
}

function finalize(steps, rule) {
  return { steps, status: "blocked", rule };
}