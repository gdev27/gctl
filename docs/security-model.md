# Security Model

This document describes **how gctl protects policy, identity, and execution**: onchain controls, client fail-closed behavior, key handling, and audit field classification. The **normative list of guarantees** (what must hold, how we fail, where it is tested) is [`trust-invariants.md`](./trust-invariants.md)—read that when you need invariant IDs for submissions or reviews.

---

## Threat overview (lightweight)

The system is designed around a few recurring adversary stories. The table links each to mitigations in this doc and to formal invariants.

| Concern | Example failure mode | Primary mitigations | Invariants |
| --- | --- | --- | --- |
| **Unauthorized policy** | Attacker publishes or swaps policy content | Registry roles; hash verification; pause | [`INV-POLICYHASH-001`](./trust-invariants.md), contract controls below |
| **Confused deputy / wrong identity** | Agent acts without ENS role proof or with spoofed names | Fail-closed planning; forward + reverse ENS checks; structured text records | [`INV-ENS-001`](./trust-invariants.md), [`INV-ENS-002`](./trust-invariants.md) |
| **Silent trust downgrade** | UI or API shows synthetic data as live | Source/trust envelopes in ops BFF and web | [`INV-SOURCE-001`](./trust-invariants.md) |
| **Secret leakage to browser** | Keys pasted into `VITE_*` | Env contract validation; separate server env | [`INV-ENV-001`](./trust-invariants.md) |
| **Opaque execution** | Runs disappear or branches ignore policy | Policy-derived workflows; reconciliation evidence | [`INV-WORKFLOW-001`](./trust-invariants.md), [`INV-WORKFLOW-002`](./trust-invariants.md) |
| **Hardcoded “magic” trust** | Demos ship with baked-in privileged addresses | Tests + env-driven demo paths | [`INV-NOHARDCODE-001`](./trust-invariants.md) |
| **Attestation confusion** | Claiming onchain proof without traceable mapping | Explicit simulated vs onchain receipts | [`INV-ATTEST-001`](./trust-invariants.md) |
| **Dependency outage** | RPC, registry, or storage unavailable | Deny planning with explicit reason; no silent allow | [`INV-FAILCLOSED-001`](./trust-invariants.md) |

This is not a full penetration-test report; it orients code review and ops around **where the system refuses to lie**.

---

## Contract controls

- `PolicyRegistry` uses:
  - `DEFAULT_ADMIN_ROLE`
  - `POLICY_ADMIN_ROLE`
  - `GUARDIAN_ROLE`
- `pause()` by guardian; `unpause()` by admin.
- This pause/unpause asymmetry is intentional: guardian can halt quickly in emergencies, while only admin can resume after incident review.
- Unauthorized policy mutation attempts revert.

---

## Fail-closed guarantees

`PolicyClient` denies planning (`allowed=false`) when any critical dependency fails:

- ENS lookup or malformed text records.
- Agent authorization missing.
- Registry read failure / inactive policy.
- Policy graph load timeout or hash mismatch.

See [`INV-FAILCLOSED-001`](./trust-invariants.md) and [`INV-POLICYHASH-001`](./trust-invariants.md).

---

## Key management

- Agent signer mode is env-injected for MVP (`AGENT_PRIVATE_KEY`).
- Versioned signer metadata tracks active key version.
- Rotation SOP:
  1. Provision new key.
  2. Update `AGENT_PRIVATE_KEY` + `AGENT_KEY_VERSION`.
  3. Verify signer health checks.
  4. Revoke old key in ops vault.

Operational steps also appear in [`operations.md`](./operations.md) (key rotation drill).

---

## Audit privacy

- Field classification:
  - `public`: plaintext
  - `restricted`: SHA-256 hash
  - `secret`: AES-GCM encrypted
- No plaintext persistence for sensitive execution payload fields.

---

## Policy artifact integrity

- Policy graphs are hash-verified at load time and again before policy evaluation.
- `PolicyRegistry` policy mutations emit previous and new hashes with a monotonic version counter for auditor traceability.
- For the OG-backed adapter path, `PolicyMeta.uri` must converge to a verifiable content address (CID or equivalent immutable digest address), not a mutable location prefix.

---

## Further reading

- [`trust-invariants.md`](./trust-invariants.md) — canonical `INV-*` list and proof paths  
- [`architecture.md`](./architecture.md) — trust boundaries diagram  
- [`operations.md`](./operations.md) — env validation, preflight, pause drill  
- [`adapter-contracts.md`](./adapter-contracts.md) — extension surfaces and stability expectations  

---

*Any change that weakens fail-closed behavior or identity checks must update this document, linked tests, and the affected rows in [`trust-invariants.md`](./trust-invariants.md).*
