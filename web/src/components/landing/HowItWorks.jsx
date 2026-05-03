import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Define a policy",
    body: "Spending caps, chain allowlists, contract allowlists, approval thresholds. Declarative, versioned, testable.",
    code: `policy.set({
  maxTxValueUsd: 500,
  dailyLimitUsd: 2000,
  allowedChains: ["base"]
})`,
  },
  {
    num: "02",
    title: "Bind to an agent",
    body: "Give the agent an objective and a wallet. The runtime intercepts every action against the policy before it touches the chain.",
    code: `agent.attach(policy)
agent.objective = "Rebalance to 60/40"
agent.wallet = wallet`,
  },
  {
    num: "03",
    title: "Run with confidence",
    body: "Watch the agent reason, propose actions, get policy-checked, and execute — all surfaced in a real-time stream.",
    code: `await agent.run()
// streams reasoning + tx
// blocks anything illegal`,
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion() === true;

  return (
    <section className="relative border-y border-border bg-card/20">
      <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="max-w-2xl mb-20">
          <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">// how it works</p>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
            Three primitives. <span className="italic">That's the whole framework.</span>
          </h2>
        </div>

        <div className="space-y-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              {...(reduceMotion
                ? { initial: false, animate: { opacity: 1, y: 0 } }
                : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.12, margin: "0px 0px 140px 0px" },
                  })}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-1 font-mono text-sm text-primary">{s.num}</div>
              <div className="lg:col-span-5">
                <h3 className="font-serif text-2xl md:text-3xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
              <div className="lg:col-span-6">
                <div className="rounded-lg border border-border bg-background/60 p-5 font-mono text-[13px] leading-relaxed overflow-x-auto scrollbar-thin">
                  <pre><code className="text-foreground/90">{s.code}</code></pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}