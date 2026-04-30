import React from "react";
import DocsSidebar from "../components/docs/DocsSidebar";
import CodeBlock from "../components/docs/CodeBlock";

const sections = [
  {
    label: "Getting started",
    items: [
      { id: "intro", title: "Introduction" },
      { id: "install", title: "Installation" },
      { id: "quickstart", title: "Quickstart" },
    ],
  },
  {
    label: "Core",
    items: [
      { id: "agent", title: "Agent" },
      { id: "policy", title: "Policy" },
      { id: "wallet", title: "Wallet" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "approvals", title: "Approvals" },
      { id: "deploy", title: "Deploying" },
    ],
  },
];

export default function Docs() {
  const [active, setActive] = React.useState("intro");

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <DocsSidebar sections={sections} active={active} onSelect={setActive} />

        <article className="prose-invert max-w-3xl">
          {active === "intro" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Getting started</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Introduction</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                gctl is an open-source TypeScript framework for building autonomous agents that move value onchain
                under explicit, declarative policy constraints.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Where most agent frameworks ship the brain and leave you to bolt on the guardrails, gctl ships the
                policy engine first. Every action — every <code className="font-mono text-foreground bg-accent px-1 rounded">approve</code>,
                every <code className="font-mono text-foreground bg-accent px-1 rounded">transfer</code>, every <code className="font-mono text-foreground bg-accent px-1 rounded">swap</code> — is intercepted, evaluated, and
                either allowed, denied, or escalated to human approval.
              </p>
              <h2 className="font-serif text-3xl mt-12 mb-4">Why policy-first?</h2>
              <p className="text-muted-foreground leading-relaxed">
                LLMs are powerful but unreliable. When you give them keys to a wallet, you need <em>structural</em>{" "}
                guarantees, not vibes. Policies in gctl are evaluated by deterministic code, not the model.
              </p>
            </>
          )}

          {active === "install" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Getting started</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Installation</h1>
              <p className="text-muted-foreground leading-relaxed">Requires Node 20+ and an EVM RPC endpoint.</p>
              <CodeBlock lang="bash">npm install @gctl/core @gctl/policy @gctl/chains-evm</CodeBlock>
              <h2 className="font-serif text-2xl mt-10 mb-3">Environment</h2>
              <CodeBlock lang="bash">{`GCTL_RPC_BASE=https://mainnet.base.org
GCTL_WALLET_PK=0x...
OPENAI_API_KEY=sk-...`}</CodeBlock>
            </>
          )}

          {active === "quickstart" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Getting started</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Quickstart</h1>
              <p className="text-muted-foreground">Define a policy, attach it to an agent, and run.</p>
              <CodeBlock lang="ts">{`import { Agent, Policy, Wallet } from "@gctl/core";

const policy = new Policy({
  maxTxValueUsd: 500,
  dailyLimitUsd: 2000,
  allowedChains: ["base"],
  requireApprovalAbove: 1000,
});

const agent = new Agent({
  name: "treasury-rebalancer",
  objective: "Maintain 60/40 USDC/ETH split",
  wallet: Wallet.fromEnv(),
  policy,
});

const result = await agent.run();
console.log(result.transactions);`}</CodeBlock>
            </>
          )}

          {active === "agent" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Core</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Agent</h1>
              <p className="text-muted-foreground leading-relaxed">
                The Agent loop: <strong className="text-foreground">observe</strong> → <strong className="text-foreground">reason</strong> → <strong className="text-foreground">propose</strong> → <strong className="text-foreground">policy-check</strong> → <strong className="text-foreground">execute</strong>.
              </p>
              <CodeBlock lang="ts">{`new Agent({
  name: string,
  objective: string,
  wallet: Wallet,
  policy: Policy,
  model?: "gpt-4o" | "claude-sonnet-4" | string,
  tools?: Tool[],
})`}</CodeBlock>
            </>
          )}

          {active === "policy" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Core</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Policy</h1>
              <p className="text-muted-foreground leading-relaxed">
                Policies are deterministic predicates evaluated against every proposed action.
              </p>
              <CodeBlock lang="ts">{`new Policy({
  maxTxValueUsd?: number,
  dailyLimitUsd?: number,
  allowedChains?: string[],
  allowedTokens?: Address[],
  allowedContracts?: Address[],
  requireApprovalAbove?: number,
  rules?: Rule[],
})`}</CodeBlock>
            </>
          )}

          {active === "wallet" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Core</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Wallet</h1>
              <p className="text-muted-foreground">EOA, smart-account (4337), and Safe adapters.</p>
              <CodeBlock lang="ts">{`Wallet.fromEnv()
Wallet.fromPrivateKey(pk)
Wallet.safe({ address, signers })`}</CodeBlock>
            </>
          )}

          {active === "approvals" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Operations</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Approvals</h1>
              <p className="text-muted-foreground">Route approvals to Slack, email, or a webhook. Block until acked.</p>
              <CodeBlock lang="ts">{`agent.on("approval_required", async (action) => {
  await slack.notify(action);
  return await waitForApproval(action.id);
});`}</CodeBlock>
            </>
          )}

          {active === "deploy" && (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3">Operations</p>
              <h1 className="font-serif text-5xl tracking-tight mb-6">Deploying</h1>
              <p className="text-muted-foreground">Run as a long-lived service, scheduled job, or serverless function.</p>
              <CodeBlock lang="bash">{`gctl deploy --schedule "*/15 * * * *" --policy treasury-v2`}</CodeBlock>
            </>
          )}
        </article>
      </div>
    </div>
  );
}