import React from "react";

const colors = {
  ethereum: "text-[#627EEA]",
  base: "text-[#0052FF]",
  arbitrum: "text-[#28A0F0]",
  optimism: "text-[#FF0420]",
  polygon: "text-[#8247E5]",
  solana: "text-[#14F195]",
};

export default function ChainBadge({ chain }) {
  if (!chain) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded border border-border bg-accent/40">
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${colors[chain] || "text-muted-foreground"}`} />
      {chain}
    </span>
  );
}