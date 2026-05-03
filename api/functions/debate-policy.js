// Multi-agent policy debate function. With OPENAI_API_KEY set we run a
// Proposer → Critic → Synthesizer chain that returns a structured policy
// template; without the key we synthesize a deterministic template from the
// use case so the UX is fully exercised in any environment.

const POLICY_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    config: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        max_tx_value_usd: { type: "number" },
        daily_spend_limit_usd: { type: "number" },
        allowed_chains: { type: "array", items: { type: "string" } },
        allowed_tokens: { type: "array", items: { type: "string" } },
        allowed_contracts: { type: "array", items: { type: "string" } },
        require_human_approval_above_usd: { type: "number" },
        is_active: { type: "boolean" },
      },
      required: [
        "name",
        "max_tx_value_usd",
        "daily_spend_limit_usd",
        "allowed_chains",
        "allowed_tokens",
        "require_human_approval_above_usd",
      ],
    },
  },
  required: ["name", "tagline", "description", "category", "tags", "config"],
};

const KNOWN_CHAINS = ["ethereum", "base", "arbitrum", "optimism", "polygon", "solana"];
const KNOWN_TOKENS = ["USDC", "USDT", "DAI", "ETH", "WETH"];
const CATEGORY_KEYWORDS = [
  { id: "treasury", words: ["treasury", "rebalance", "operating", "stables"] },
  { id: "yield", words: ["yield", "apy", "stake", "lend", "farm"] },
  { id: "payments", words: ["payroll", "vendor", "invoice", "pay", "disburse"] },
  { id: "trading", words: ["trade", "market", "mm", "rebalancer"] },
  { id: "experimental", words: ["sandbox", "test", "experiment", "small"] },
  { id: "observation", words: ["observe", "monitor", "read", "watch"] },
];

function pickCategory(text) {
  const lower = text.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.words.some((w) => lower.includes(w))) return entry.id;
  }
  return "custom";
}

function pickChains(text) {
  const lower = text.toLowerCase();
  const matches = KNOWN_CHAINS.filter((c) => lower.includes(c));
  return matches.length > 0 ? matches : ["base"];
}

function pickTokens(text) {
  const lower = text.toLowerCase();
  const matches = KNOWN_TOKENS.filter((t) => lower.includes(t.toLowerCase()));
  return matches.length > 0 ? matches : ["USDC"];
}

function inferCaps(text, category) {
  const lower = text.toLowerCase();
  if (lower.includes("strict") || lower.includes("conservative") || category === "experimental") {
    return { perTx: 250, daily: 1000, approval: 500 };
  }
  if (lower.includes("aggressive") || lower.includes("high-frequency") || category === "trading") {
    return { perTx: 5000, daily: 25000, approval: 7500 };
  }
  if (category === "yield") {
    return { perTx: 10000, daily: 50000, approval: 15000 };
  }
  if (category === "payments") {
    return { perTx: 5000, daily: 25000, approval: 2500 };
  }
  if (category === "observation") {
    return { perTx: 0, daily: 0, approval: 0 };
  }
  return { perTx: 1000, daily: 5000, approval: 2500 };
}

function titleCase(s) {
  return s.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function deterministicTemplate(useCase) {
  const trimmed = useCase.trim();
  const category = pickCategory(trimmed);
  const chains = pickChains(trimmed);
  const tokens = pickTokens(trimmed);
  const caps = inferCaps(trimmed, category);
  const niceCategory = titleCase(category);
  const name = `${niceCategory} ${chains.length > 1 ? "Multichain" : chains[0]} Guardrail`
    .replace(/\b[a-z]/g, (m) => m.toUpperCase())
    .slice(0, 48);
  const tagline =
    category === "observation"
      ? "Read-only watcher; no spending."
      : `Caps tuned for ${category} on ${chains.join(", ")}.`;
  const description =
    `Synthesized from your brief: "${trimmed.slice(0, 180)}${trimmed.length > 180 ? "…" : ""}". ` +
    `Per-transaction cap ${caps.perTx}, daily ceiling ${caps.daily}, ` +
    `approvals required above ${caps.approval}.`;
  const tags = Array.from(
    new Set([category, ...(chains.length > 1 ? ["multichain"] : chains), tokens[0].toLowerCase()]),
  ).slice(0, 4);
  const debateLog = [
    {
      agent: "PROPOSER",
      role: "proposer",
      message: `Drafted starting limits sized for ${category} on ${chains.join(", ")} with ${tokens.join(", ")}.`,
    },
    {
      agent: "CRITIC",
      role: "critic",
      message: `Pushed back on the per-tx ceiling and added an explicit approval threshold above $${caps.approval}.`,
    },
    {
      agent: "SYNTHESIZER",
      role: "synthesizer",
      message: `Settled on "${name}" — ${tagline}`,
    },
  ];
  return {
    name,
    tagline,
    description,
    category,
    tags,
    source: "deterministic",
    use_case: trimmed,
    debate_log: debateLog,
    config: {
      name,
      description,
      max_tx_value_usd: caps.perTx,
      daily_spend_limit_usd: caps.daily,
      allowed_chains: chains,
      allowed_tokens: tokens,
      allowed_contracts: [],
      require_human_approval_above_usd: caps.approval,
      is_active: true,
    },
    uses_count: 0,
  };
}

/** Per-request key from the client (BYOK). Never logged or returned. */
function normalizeClientOpenAiKey(raw) {
  if (typeof raw !== "string") return null;
  const k = raw.trim();
  if (k.length < 20 || k.length > 512) return null;
  if (!k.startsWith("sk-")) return null;
  if (/[\s\r\n]/.test(k)) return null;
  return k;
}

function normalizeClientOpenAiModel(raw) {
  if (typeof raw !== "string") return null;
  const m = raw.trim();
  if (m.length < 2 || m.length > 64) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(m)) return null;
  return m;
}

async function callOpenAI(prompt, schema, creds = {}) {
  const apiKey = creds.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = creds.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const messages = [
    {
      role: "system",
      content:
        "You are a careful policy designer for autonomous onchain agents. Respond ONLY with the requested JSON when a schema is enforced.",
    },
    { role: "user", content: prompt },
  ];
  const body = {
    model,
    messages,
    temperature: 0.3,
  };
  if (schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "PolicyTemplate", schema, strict: false },
    };
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  if (schema) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return content;
}

async function llmDebate(useCase, creds = {}) {
  const proposerPrompt =
    `Use case: "${useCase.trim()}".\n\n` +
    `Draft a sensible starting policy for an autonomous onchain agent. Cover per-tx caps, daily ` +
    `limits, allowed chains and tokens, and human-approval thresholds. Reply in 2-4 short paragraphs.`;
  const proposerOut = await callOpenAI(proposerPrompt, undefined, creds);
  if (!proposerOut) return null;

  const criticPrompt =
    `Use case: "${useCase.trim()}".\n\nPROPOSER drafted:\n"""\n${proposerOut}\n"""\n\n` +
    `Push back on weak points (caps too generous, missing allowlists, insufficient approvals). ` +
    `End with bullet-list changes.`;
  const criticOut = await callOpenAI(criticPrompt, undefined, creds);
  if (!criticOut) return null;

  const synthPrompt =
    `Use case: "${useCase.trim()}".\n\nPROPOSER:\n"""\n${proposerOut}\n"""\n\nCRITIC:\n"""\n${criticOut}\n"""\n\n` +
    `Produce the final balanced policy as JSON only. Numeric values must be plain numbers. ` +
    `Choose ONE category from: treasury, yield, payments, trading, experimental, observation, custom. ` +
    `Add 2-4 tags (lowercase). Set config.is_active to true. allowed_contracts may be an empty array.`;
  const finalPolicy = await callOpenAI(synthPrompt, POLICY_JSON_SCHEMA, creds);
  if (!finalPolicy) return null;

  finalPolicy.config = finalPolicy.config || {};
  if (!finalPolicy.config.name) finalPolicy.config.name = finalPolicy.name;
  if (!finalPolicy.config.description) finalPolicy.config.description = finalPolicy.description;
  if (finalPolicy.config.is_active == null) finalPolicy.config.is_active = true;
  if (!Array.isArray(finalPolicy.config.allowed_contracts)) finalPolicy.config.allowed_contracts = [];

  return {
    ...finalPolicy,
    source: "llm_debate",
    use_case: useCase.trim(),
    uses_count: 0,
    debate_log: [
      { agent: "PROPOSER", role: "proposer", message: proposerOut },
      { agent: "CRITIC", role: "critic", message: criticOut },
      {
        agent: "SYNTHESIZER",
        role: "synthesizer",
        message: `Settled on "${finalPolicy.name}" — ${finalPolicy.tagline}`,
      },
    ],
  };
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = await readJsonBody(req);
  const useCase = typeof body?.useCase === "string" ? body.useCase : "";
  if (useCase.trim().length < 5) {
    res.status(400).json({ error: "Provide a use case description (at least 5 characters)." });
    return;
  }
  const clientKey = normalizeClientOpenAiKey(body.openaiApiKey ?? body.openai_api_key);
  const clientModel = normalizeClientOpenAiModel(body.openaiModel ?? body.openai_model);
  const llmCreds = {};
  if (clientKey) llmCreds.apiKey = clientKey;
  if (clientModel) llmCreds.model = clientModel;
  let template;
  try {
    template = (await llmDebate(useCase, llmCreds)) || deterministicTemplate(useCase);
  } catch (err) {
    console.error("debate-policy LLM failure, falling back to deterministic:", err?.message || err);
    template = deterministicTemplate(useCase);
  }
  const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const created = {
    id,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...template,
  };
  res.status(200).json({ template: created });
}
