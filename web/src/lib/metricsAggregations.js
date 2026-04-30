// Pure aggregation helpers for the Overview "Metrics" tab.
// Keeps the React components thin and testable.

import { format, subDays, startOfDay } from "date-fns";

export function computeMetrics(txs, agents) {
  const totalCount = txs.length;
  const successful = txs.filter((t) => t.status === "success");
  const blocked = txs.filter((t) => t.status === "policy_blocked");
  const totalVolume = successful.reduce((s, t) => s + (t.value_usd || 0), 0);
  const totalGas = txs.reduce((s, t) => s + (t.gas_used_usd || 0), 0);
  const avgGas = totalCount ? totalGas / totalCount : 0;

  // Daily windows for last 30 days
  const days = [];
  for (let i = 29; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), "MMM d"));
  }
  const keyOf = (t) => {
    const d = t.executed_at || t.created_date;
    if (!d) return null;
    return format(startOfDay(new Date(d)), "MMM d");
  };

  const dailyVolume = days.map((date) => ({ date, volume: 0 }));
  const dailyOutcomes = days.map((date) => ({ date, successRate: null, total: 0, success: 0 }));
  const dailyVolumeIdx = Object.fromEntries(dailyVolume.map((d, i) => [d.date, i]));

  for (const t of txs) {
    const k = keyOf(t);
    if (k == null) continue;
    const i = dailyVolumeIdx[k];
    if (i == null) continue;
    if (t.status === "success") {
      dailyVolume[i].volume += t.value_usd || 0;
    }
    dailyOutcomes[i].total += 1;
    if (t.status === "success") dailyOutcomes[i].success += 1;
  }
  for (const o of dailyOutcomes) {
    o.successRate = o.total > 0 ? Math.round((o.success / o.total) * 1000) / 10 : null;
  }

  // Top performing agents (by total executed value, with success-rate tag)
  const agentStats = {};
  for (const t of txs) {
    if (!t.agent_name) continue;
    const a = (agentStats[t.agent_name] ||= { name: t.agent_name, volume: 0, total: 0, success: 0, gas: 0 });
    a.total += 1;
    a.gas += t.gas_used_usd || 0;
    if (t.status === "success") {
      a.success += 1;
      a.volume += t.value_usd || 0;
    }
  }
  const topAgents = Object.values(agentStats)
    .map((a) => ({ ...a, successRate: a.total ? a.success / a.total : 0 }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  // Gas distribution by chain
  const gasByChainAcc = {};
  for (const t of txs) {
    const c = t.chain || "unknown";
    const x = (gasByChainAcc[c] ||= { chain: c, gas: 0, count: 0 });
    x.gas += t.gas_used_usd || 0;
    x.count += 1;
  }
  const gasByChain = Object.values(gasByChainAcc)
    .map((x) => ({ ...x, avg: x.count ? x.gas / x.count : 0 }))
    .sort((a, b) => b.gas - a.gas);

  return {
    totalCount,
    successCount: successful.length,
    blockedCount: blocked.length,
    successRate: totalCount ? successful.length / totalCount : 0,
    blockRate: totalCount ? blocked.length / totalCount : 0,
    totalVolume,
    totalGas,
    avgGas,
    dailyVolume,
    dailyOutcomes,
    topAgents,
    gasByChain,
  };
}