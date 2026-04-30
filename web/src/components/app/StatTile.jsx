import React from "react";

export default function StatTile({ label, value, sublabel, accent = false }) {
  return (
    <div className={`rounded-lg border border-border p-5 ${accent ? "bg-card" : "bg-card/40"}`}>
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl mt-2 tracking-tight">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1.5 font-mono">{sublabel}</p>}
    </div>
  );
}