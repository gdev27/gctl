import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, LineChart, BarChart3 } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import OverviewTab from "../components/dashboard/OverviewTab";
import PerformanceTab from "../components/dashboard/PerformanceTab";
import MetricsTab from "../components/dashboard/MetricsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "performance", label: "Performance", icon: LineChart },
];

export default function Dashboard() {
  const [tab, setTab] = React.useState("overview");

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.Agent.list("-updated_date"),
  });
  const { data: txs = [] } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => base44.entities.Transaction.list("-executed_at", 8),
  });

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// overview"
        title="Mission control"
        description="Live view of every agent operating under your policies."
        action={
          <Link to="/dashboard/agents">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> New agent
            </Button>
          </Link>
        }
      />

      <div className="px-6 lg:px-10 pt-4 border-b border-border">
        <div className="flex gap-1">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {t.label}
                {active && <span className="absolute bottom-[-1px] left-0 right-0 h-px bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8">
        {tab === "overview" && <OverviewTab agents={agents} txs={txs} />}
        {tab === "metrics" && <MetricsTab />}
        {tab === "performance" && <PerformanceTab />}
      </div>
    </div>
  );
}