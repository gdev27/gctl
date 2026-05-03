import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const cases = [
  { title: "Treasury rebalancing", body: "Keep portfolio splits within a band, capped per tx, approval-gated above threshold." },
  { title: "Yield routing", body: "Move idle stables to the best risk-adjusted yield, never exceeding daily limits." },
  { title: "Payroll & vendor pay", body: "Disburse to allowlisted addresses on a schedule, with override checks." },
  { title: "Market making", body: "Quote and rebalance on DEXs within strict notional and slippage bounds." },
  { title: "Bridging & rollup ops", body: "Move funds between chains only along pre-approved paths." },
  { title: "Grants & disbursements", body: "Release milestone-based payments with multi-sig style approvals." },
];

export default function UseCases() {
  const reduceMotion = useReducedMotion() === true;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
      <div className="max-w-2xl mb-16">
        <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">// in production</p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
          What teams build with gctl.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            {...(reduceMotion
              ? { initial: false, animate: { opacity: 1, y: 0 } }
              : {
                  initial: { opacity: 0, y: 16 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.12, margin: "0px 0px 100px 0px" },
                })}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card/40 p-6 hover:border-primary/30 hover:bg-card transition-all"
          >
            <h3 className="font-medium mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}