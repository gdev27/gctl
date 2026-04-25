# Security Model

## Contract controls
- `PolicyRegistry` uses:
  - `DEFAULT_ADMIN_ROLE`
  - `POLICY_ADMIN_ROLE`
  - `GUARDIAN_ROLE`
- `pause()` by guardian; `unpause()` by admin.
- Unauthorized policy mutation attempts revert.

## Fail-closed guarantees
`PolicyClient` denies planning (`allowed=false`) when any critical dependency fails:
- ENS lookup or malformed text records.
- Agent authorization missing.
- Registry read failure / inactive policy.
- Policy graph load timeout or hash mismatch.

## Key management
- Agent signer mode is env-injected for MVP (`AGENT_PRIVATE_KEY`).
- Versioned signer metadata tracks active key version.
- Rotation SOP:
  1. Provision new key.
  2. Update `AGENT_PRIVATE_KEY` + `AGENT_KEY_VERSION`.
  3. Verify signer health checks.
  4. Revoke old key in ops vault.

## Audit privacy
- Field classification:
  - `public`: plaintext
  - `restricted`: SHA-256 hash
  - `secret`: AES-GCM encrypted
- No plaintext persistence for sensitive execution payload fields.
