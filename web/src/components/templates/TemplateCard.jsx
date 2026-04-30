import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Sparkles } from "lucide-react";

const accentMap = {
  primary: "text-primary",
  "chart-2": "text-[hsl(var(--chart-2))]",
  "chart-3": "text-[hsl(var(--chart-3))]",
  "chart-4": "text-[hsl(var(--chart-4))]",
  "chart-5": "text-[hsl(var(--chart-5))]",
  muted: "text-muted-foreground",
};

export default function TemplateCard({ template, onPick, index = 0 }) {
  const accent = template.accent || "primary";
  const isAi = template.source === "ai_debate";
  return (
    <motion.button
      onClick={() => onPick(template)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="text-left rounded-xl border border-border bg-card/40 p-5 hover:border-primary/40 hover:bg-card transition-all group relative"
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isAi && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))] border border-[hsl(var(--chart-3))]/20">
            <Sparkles className="w-2.5 h-2.5" /> ai
          </span>
        )}
        {template.badge && (
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {template.badge}
          </span>
        )}
      </div>

      <Shield className={`w-5 h-5 mb-3 ${accentMap[accent] || "text-foreground"}`} strokeWidth={1.5} />
      <h3 className="font-medium pr-16">{template.name}</h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.tagline}</p>

      {template.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {template.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
        <Stat label="max/tx" value={fmtUsd(template.config?.max_tx_value_usd)} />
        <Stat label="daily" value={fmtUsd(template.config?.daily_spend_limit_usd)} />
        <Stat label="chains" value={template.config?.allowed_chains?.length || "any"} />
      </dl>

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
        use template <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </motion.button>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{label}</dt>
      <dd className="text-xs font-mono mt-0.5">{value}</dd>
    </div>
  );
}

function fmtUsd(n) {
  if (n == null || n === "") return "—";
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}