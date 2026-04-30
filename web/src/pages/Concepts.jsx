import React from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Eye, Workflow } from "lucide-react";

const concepts = [
  {
    icon: Shield,
    name: "Policy Engine",
    summary: "Deterministic rules evaluated against every proposed action.",
    detail: "Policies are pure predicates — no LLM in the loop. They run as bytecode-style rules: cheap, reproducible, and unit-testable. You can layer policies (org → team → agent) and gctl will resolve the most restrictive intersection.",
  },
  {
    icon: Cpu,
    name: "Agent Loop",
    summary: "Observe, reason, propose, check, execute — repeat.",
    detail: "Each tick the agent observes its world (balances, prices, oracles), reasons toward its objective, proposes a concrete action, hands it to the policy engine, and only executes if approved. Reasoning is captured for audit.",
  },
  {
    icon: Workflow,
    name: "Approval Pipeline",
    summary: "Human in the loop, only when policy demands.",
    detail: "Above-threshold or out-of-band actions are escalated. The agent pauses, the request is routed to your channel of choice, and execution resumes only on a signed approval.",
  },
  {
    icon: Eye,
    name: "Audit Trail",
    summary: "Every decision, queryable and replayable.",
    detail: "Reasoning, policy checks, transactions, and approvals are written to an append-only log. Replay any past run; export to your data warehouse.",
  },
];

export default function Concepts() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-24">
      <div className="max-w-3xl mb-16">
        <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">// concepts</p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-balance">
          Four ideas. <span className="italic">Everything else is plumbing.</span>
        </h1>
      </div>

      <div className="space-y-px bg-border rounded-xl overflow-hidden border border-border">
        {concepts.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="bg-card p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            <div className="md:col-span-1">
              <c.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="md:col-span-4">
              <p className="font-mono text-xs text-muted-foreground mb-2">0{i + 1}</p>
              <h2 className="font-serif text-3xl">{c.name}</h2>
              <p className="text-sm text-muted-foreground mt-2">{c.summary}</p>
            </div>
            <div className="md:col-span-7">
              <p className="text-foreground/80 leading-relaxed">{c.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}