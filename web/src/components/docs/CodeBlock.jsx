import React from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ children, lang = "ts" }) {
  const [copied, setCopied] = React.useState(false);
  const code = typeof children === "string" ? children : "";

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="relative group rounded-lg border border-border bg-card/60 my-6">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="font-mono text-[11px] uppercase text-muted-foreground tracking-wider">{lang}</span>
        <button
          onClick={copy}
          className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-5 text-[13px] font-mono leading-relaxed overflow-x-auto scrollbar-thin">
        <code>{children}</code>
      </pre>
    </div>
  );
}