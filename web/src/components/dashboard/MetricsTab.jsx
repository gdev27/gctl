import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import StatTile from "../app/StatTile";
import VolumeOverTime from "./metrics/VolumeOverTime";
import SuccessRateTrend from "./metrics/SuccessRateTrend";
import TopAgents from "./metrics/TopAgents";
import GasDistribution from "./metrics/GasDistribution";
import { computeMetrics } from "@/lib/metricsAggregations";

export default function MetricsTab() {
  const { data: txs = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions", "metrics"],
    queryFn: () => base44.entities.Transaction.list("-executed_at", 500),
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list(),
  });

  const m = React.useMemo(() => computeMetrics(txs, agents), [txs, agents]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Total volume" value={`$${m.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sublabel="all-time, executed" accent />
        <StatTile label="Success rate" value={`${(m.successRate * 100).toFixed(1)}%`} sublabel={`${m.successCount} of ${m.totalCount}`} />
        <StatTile label="Total gas" value={`$${m.totalGas.toFixed(2)}`} sublabel={`avg $${m.avgGas.toFixed(4)}/tx`} />
        <StatTile label="Policy blocks" value={m.blockedCount} sublabel={`${(m.blockRate * 100).toFixed(1)}% of attempts`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeOverTime data={m.dailyVolume} loading={txLoading} />
        <SuccessRateTrend data={m.dailyOutcomes} loading={txLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopAgents data={m.topAgents} loading={txLoading} />
        <GasDistribution data={m.gasByChain} loading={txLoading} />
      </div>
    </div>
  );
}