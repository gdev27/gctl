import React from "react";
import { Layers, Wallet, TrendingUp, Send, ArrowLeftRight, FlaskConical, Eye, Sparkles } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/lib/policyTemplates";

const ICONS = { Layers, Wallet, TrendingUp, Send, ArrowLeftRight, FlaskConical, Eye, Sparkles };

export default function CategoryFilter({ active, onChange, counts = {} }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TEMPLATE_CATEGORIES.map((c) => {
        const Icon = ICONS[c.icon] || Layers;
        const isActive = active === c.id;
        const count = c.id === "all"
          ? Object.values(counts).reduce((s, v) => s + v, 0)
          : counts[c.id] || 0;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors border ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <Icon className="w-3 h-3" strokeWidth={2} />
            {c.label}
            {count > 0 && (
              <span className={`ml-0.5 ${isActive ? "opacity-80" : "text-muted-foreground/70"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}