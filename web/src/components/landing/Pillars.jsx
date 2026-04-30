import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Eye, GitBranch } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Policy first",
    body: "Hard limits, allowlists, and approval thresholds enforced before any onchain action. Agents can't break what they can't reach.",
  },
  {
    icon: Zap,
    title: "Multi-chain",
    body: "Native support for Ethereum, Base, Arbitrum, Optimism, and more. One policy, every chain.",
  },
  {
    icon: Eye,
    title: "Fully auditable",
    body: "Every decision, every reasoning trace, every transaction — recorded and queryable.",
  },
  {
    icon: GitBranch,
    title: "Open source",
    body: "Self-host the runtime, fork the policy engine, or contribute back.",
  },
];

export default function Pillars() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32">
      <div className="max-w-2xl mb-16">
        <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">// principles</p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
          Built for autonomy you can <span className="italic">actually trust</span>.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="bg-card p-8 group hover:bg-accent/30 transition-colors"
          >
            <p.icon className="w-5 h-5 text-primary mb-6" strokeWidth={1.5} />
            <h3 className="font-medium text-lg mb-3">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}