// Drop-in replacement for @base44/sdk that we previously imported from
// `@/api/base44Client`. It preserves the public surface (`{ entities, functions,
// auth, users }`) but routes data to:
//   • Vercel Functions under `/api/ops/*` for indexed Policy + Transaction reads
//     (with fail-soft fallback to local seed data when the function is offline)
//   • localStorage for entities the indexer doesn't model
//   • `/api/functions/<name>` for `functions.invoke(...)`
//   • a deterministic local admin user for `auth.me()`

import {
  SEED_AGENTS,
  SEED_AGENT_MESSAGES,
  SEED_ALERTS,
  SEED_ALERT_EVENTS,
  SEED_POLICIES,
  SEED_POLICY_TEMPLATES,
  SEED_TEAM_MEMBERS,
  SEED_TRANSACTIONS,
  SEED_USER,
} from "@/api/seeds";

const STORAGE_PREFIX = "gctl:";
const USER_STORAGE_KEY = "gctl:user";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const nowIso = () => new Date().toISOString();
const genId = () => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function lsGet(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / unavailable errors
  }
}

function applyOrderBy(arr, orderBy) {
  if (!orderBy) return arr;
  const desc = orderBy.startsWith("-");
  const field = desc ? orderBy.slice(1) : orderBy;
  return [...arr].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return desc ? 1 : -1;
    if (bv == null) return desc ? -1 : 1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

function matchesFilter(item, query) {
  for (const [k, v] of Object.entries(query || {})) {
    const value = item[k];
    if (Array.isArray(v)) {
      if (!v.includes(value)) return false;
    } else if (value !== v) {
      return false;
    }
  }
  return true;
}

class LocalEntityStore {
  constructor(name, seed = []) {
    this.name = name;
    this.key = `${STORAGE_PREFIX}${name}`;
    this.seed = seed;
    this._ensureSeeded();
  }

  _ensureSeeded() {
    if (!isBrowser()) return;
    if (window.localStorage.getItem(this.key) != null) return;
    const seeded = this.seed.map((item) => ({
      id: item.id || genId(),
      created_date: item.created_date || nowIso(),
      updated_date: item.updated_date || nowIso(),
      ...item,
    }));
    lsSet(this.key, seeded);
  }

  _read() {
    return lsGet(this.key, []);
  }

  _write(items) {
    lsSet(this.key, items);
  }

  async list(orderBy, limit) {
    let arr = this._read();
    arr = applyOrderBy(arr, orderBy);
    if (limit != null) arr = arr.slice(0, limit);
    return arr;
  }

  async filter(query, orderBy, limit) {
    let arr = this._read().filter((item) => matchesFilter(item, query));
    arr = applyOrderBy(arr, orderBy);
    if (limit != null) arr = arr.slice(0, limit);
    return arr;
  }

  async get(id) {
    return this._read().find((i) => i.id === id) || null;
  }

  async create(data) {
    const items = this._read();
    const created = {
      id: data?.id || genId(),
      created_date: nowIso(),
      updated_date: nowIso(),
      ...data,
    };
    items.unshift(created);
    this._write(items);
    return created;
  }

  async update(id, data) {
    const items = this._read();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      const fallback = {
        id,
        created_date: nowIso(),
        updated_date: nowIso(),
        ...data,
      };
      items.unshift(fallback);
      this._write(items);
      return fallback;
    }
    const merged = { ...items[idx], ...data, id, updated_date: nowIso() };
    items[idx] = merged;
    this._write(items);
    return merged;
  }

  async delete(id) {
    const items = this._read();
    this._write(items.filter((i) => i.id !== id));
    return true;
  }
}

const policyStatusFromState = {
  succeeded: "success",
  partial_fill: "success",
  reverted: "failed",
  timed_out: "failed",
  cancelled: "failed",
  denied: "policy_blocked",
  running: "pending",
};

function indexedPolicyToBase44(p) {
  const updatedIso = new Date(p.updatedAt || Date.now()).toISOString();
  const prettyName = String(p.policyId || "policy")
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    id: p.policyId,
    name: prettyName,
    description: `Onchain policy ${p.policyId}. Hash ${p.hash}. Stored at ${p.uri}.`,
    is_active: !!p.active,
    allowed_chains: [],
    allowed_tokens: [],
    allowed_contracts: [],
    max_tx_value_usd: undefined,
    daily_spend_limit_usd: undefined,
    require_human_approval_above_usd: undefined,
    source: "indexer",
    indexer_hash: p.hash,
    indexer_uri: p.uri,
    created_date: updatedIso,
    updated_date: updatedIso,
  };
}

function indexedWorkflowToBase44(w) {
  const ts = new Date(w.updatedAt || Date.now()).toISOString();
  const status = policyStatusFromState[w.state] || "pending";
  return {
    id: w.runId,
    tx_hash: w.runId,
    block_number: undefined,
    agent_name: w.workflowId || "indexer-workflow",
    action_type: w.pathType ? `${w.pathType}_path` : "workflow",
    chain: "base",
    token_symbol: "USDC",
    token_amount: 0,
    value_usd: 0,
    from_address: "",
    to_address: "",
    gas_used_usd: 0,
    status,
    policy_check: {
      passed: status === "success",
      rule_triggered: status === "policy_blocked" ? "fail_closed" : null,
      reason: status === "policy_blocked" ? "Workflow ended in fail-closed terminal state." : null,
    },
    reasoning: w.auditPath
      ? `Run ${w.runId} of workflow ${w.workflowId}; audit path ${w.auditPath}.`
      : `Run ${w.runId} of workflow ${w.workflowId}.`,
    audit_path: w.auditPath,
    indexer_state: w.state,
    indexer_path_type: w.pathType,
    executed_at: ts,
    created_date: ts,
    updated_date: ts,
    source: "indexer",
  };
}

async function fetchEnvelope(path) {
  if (!isBrowser()) return null;
  try {
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const body = await res.json();
    if (body && Array.isArray(body.data)) return body.data;
    if (Array.isArray(body)) return body;
    return null;
  } catch {
    return null;
  }
}

class IndexerPolicyStore extends LocalEntityStore {
  constructor() {
    super("Policy", SEED_POLICIES);
  }

  async list(orderBy, limit) {
    const indexed = await fetchEnvelope("/api/ops/policies");
    const local = this._read();
    let merged;
    if (indexed && indexed.length > 0) {
      const overrides = new Map(local.map((p) => [p.id, p]));
      const indexedMapped = indexed.map((p) => {
        const base = indexedPolicyToBase44(p);
        const override = overrides.get(base.id);
        return override ? { ...base, ...override, id: base.id, source: override.source || "local" } : base;
      });
      const localOnly = local.filter((p) => !indexed.some((ip) => ip.policyId === p.id));
      merged = [...indexedMapped, ...localOnly];
    } else {
      merged = local;
    }
    merged = applyOrderBy(merged, orderBy);
    if (limit != null) merged = merged.slice(0, limit);
    return merged;
  }
}

class IndexerTransactionStore extends LocalEntityStore {
  constructor() {
    super("Transaction", SEED_TRANSACTIONS);
  }

  async list(orderBy = "-executed_at", limit) {
    const indexed = await fetchEnvelope("/api/ops/workflows");
    const local = this._read();
    let merged;
    if (indexed && indexed.length > 0) {
      const overrides = new Map(local.map((t) => [t.id, t]));
      const indexedMapped = indexed.map((w) => {
        const base = indexedWorkflowToBase44(w);
        const override = overrides.get(base.id);
        return override ? { ...base, ...override, id: base.id, source: override.source || "local" } : base;
      });
      const localOnly = local.filter((t) => !indexed.some((iw) => iw.runId === t.id));
      merged = [...indexedMapped, ...localOnly];
    } else {
      merged = local;
    }
    merged = applyOrderBy(merged, orderBy);
    if (limit != null) merged = merged.slice(0, limit);
    return merged;
  }
}

const entities = {
  Agent: new LocalEntityStore("Agent", SEED_AGENTS),
  AgentMessage: new LocalEntityStore("AgentMessage", SEED_AGENT_MESSAGES),
  Alert: new LocalEntityStore("Alert", SEED_ALERTS),
  AlertEvent: new LocalEntityStore("AlertEvent", SEED_ALERT_EVENTS),
  Policy: new IndexerPolicyStore(),
  PolicyTemplate: new LocalEntityStore("PolicyTemplate", SEED_POLICY_TEMPLATES),
  Team: new LocalEntityStore("Team", []),
  TeamMember: new LocalEntityStore("TeamMember", SEED_TEAM_MEMBERS),
  Transaction: new IndexerTransactionStore(),
};

function loadOrSeedUser() {
  const stored = lsGet(USER_STORAGE_KEY, null);
  if (stored && stored.id) return stored;
  lsSet(USER_STORAGE_KEY, SEED_USER);
  return SEED_USER;
}

const auth = {
  async me() {
    return loadOrSeedUser();
  },
  logout() {
    if (isBrowser()) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  },
  redirectToLogin() {
    // No-op: the web app ships with a pre-authenticated default operator.
  },
  async setRole(role) {
    const next = { ...loadOrSeedUser(), role };
    lsSet(USER_STORAGE_KEY, next);
    return next;
  },
};

const users = {
  async inviteUser(email, role) {
    return { email, role, status: "invited", invited_at: nowIso() };
  },
};

const functions = {
  async invoke(name, body) {
    if (!isBrowser()) return { data: null };
    const path = `/api/functions/${name}`;
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body || {}),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const err = /** @type {Error & { status?: number; data?: unknown }} */ (
          new Error(data?.error || `Function ${name} failed (${res.status})`)
        );
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return { data };
    } catch (err) {
      if (err && typeof err === "object" && "status" in err) throw err;
      const wrapped = new Error(`Function ${name} unreachable`);
      wrapped.cause = err;
      throw wrapped;
    }
  },
};

export const base44 = { entities, auth, users, functions };
