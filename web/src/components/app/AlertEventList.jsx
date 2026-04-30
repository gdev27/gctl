import React from "react";
import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const severityConfig = {
  info: { icon: Info, color: "text-[hsl(var(--chart-2))]" },
  warning: { icon: AlertTriangle, color: "text-[hsl(var(--chart-4))]" },
  critical: { icon: AlertCircle, color: "text-destructive" },
};

export default function AlertEventList({ events, onAcknowledge }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/20 p-12 text-center">
        <Check className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.5} />
        <p className="font-medium">All quiet</p>
        <p className="text-sm text-muted-foreground mt-1">No alerts have triggered yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden divide-y divide-border">
      {events.map((e) => {
        const c = severityConfig[e.severity] || severityConfig.warning;
        const Icon = c.icon;
        return (
          <div key={e.id} className={`p-4 flex items-start gap-3 ${e.acknowledged ? "opacity-60" : ""}`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.color}`} strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium truncate">{e.alert_name}</p>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0" title={e.created_date}>
                  {e.created_date ? formatDistanceToNow(new Date(e.created_date), { addSuffix: true }) : "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{e.message}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                {e.agent_name && <span>agent: {e.agent_name}</span>}
                <span>type: {e.trigger_type}</span>
                {e.created_date && <span>{format(new Date(e.created_date), "MMM d HH:mm:ss")}</span>}
              </div>
            </div>
            {!e.acknowledged && (
              <button
                onClick={() => onAcknowledge(e)}
                className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                ack
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}