import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [copied, setCopied] = React.useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install @gctl/core");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="relative overflow-hidden">
      {/* background grid + gradient */}
      <div className="absolute inset-0 grid-bg radial-fade pointer-events-none" />
      <div className="absolute inset-x-0 -top-40 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight max-w-5xl"
        >
          Autonomous agents that move value{" "}
          <span className="italic text-primary">within rules</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed"
        >
          gctl is an open-source framework for building policy-constrained autonomous agents
          that act onchain. Define what they can spend, where, and when — then let them run.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <Link to="/docs">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-12 px-6 group">
              Get started
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>

          <button
            onClick={copyInstall}
            className="h-12 px-5 flex items-center gap-3 rounded-md border border-border bg-card/40 backdrop-blur font-mono text-sm hover:border-primary/40 hover:bg-card transition-colors group"
          >
            <span className="text-muted-foreground">$</span>
            <span>npm install @gctl/core</span>
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />}
          </button>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4 }}
      className="mt-20 relative"
    >
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-2">agent.ts</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">policy: treasury-v2</span>
        </div>
        <pre className="p-6 text-[13px] font-mono leading-relaxed overflow-x-auto scrollbar-thin">
<code>
<span className="text-muted-foreground">// Define a policy-constrained agent</span>{"\n"}
<span className="text-[hsl(var(--chart-3))]">import</span> {"{"} <span className="text-foreground">Agent, Policy</span> {"}"} <span className="text-[hsl(var(--chart-3))]">from</span> <span className="text-primary">"@gctl/core"</span>;{"\n\n"}
<span className="text-[hsl(var(--chart-3))]">const</span> <span className="text-foreground">policy</span> = <span className="text-[hsl(var(--chart-3))]">new</span> <span className="text-foreground">Policy</span>({"{"}{"\n"}
{"  "}<span className="text-foreground">maxTxValueUsd</span>: <span className="text-primary">500</span>,{"\n"}
{"  "}<span className="text-foreground">dailyLimitUsd</span>: <span className="text-primary">2_000</span>,{"\n"}
{"  "}<span className="text-foreground">allowedChains</span>: [<span className="text-primary">"base"</span>, <span className="text-primary">"arbitrum"</span>],{"\n"}
{"  "}<span className="text-foreground">requireApprovalAbove</span>: <span className="text-primary">1_000</span>,{"\n"}
{"}"});{"\n\n"}
<span className="text-[hsl(var(--chart-3))]">const</span> <span className="text-foreground">agent</span> = <span className="text-[hsl(var(--chart-3))]">new</span> <span className="text-foreground">Agent</span>({"{"}{"\n"}
{"  "}<span className="text-foreground">name</span>: <span className="text-primary">"treasury-rebalancer"</span>,{"\n"}
{"  "}<span className="text-foreground">objective</span>: <span className="text-primary">"Maintain 60/40 USDC/ETH split"</span>,{"\n"}
{"  "}<span className="text-foreground">policy</span>,{"\n"}
{"}"});{"\n\n"}
<span className="text-[hsl(var(--chart-3))]">await</span> <span className="text-foreground">agent</span>.<span className="text-foreground">run</span>();
</code>
        </pre>
      </div>
      {/* glow */}
      <div className="absolute -inset-x-20 -bottom-10 h-32 bg-gradient-to-t from-primary/20 to-transparent blur-3xl pointer-events-none" />
    </motion.div>
  );
}