# Contributing

Thanks for contributing to gctl.

## Development setup

1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - `cp .env.example .env`
3. Run local quality checks:
   - `npm run verify`
4. Remove generated runtime state before preparing PR snapshots:
   - `npm run clean:runtime`

## Contribution workflow

1. Open an issue describing bug, feature, or adapter proposal.
2. Fork and create a focused branch (`feat/adapter-foo` or `fix/reconcile-timeout`).
3. Add tests with any behavior change.
4. Update docs if integration or workflow semantics changed.
5. Submit PR with:
   - clear problem statement
   - architecture impact
   - verification steps (`npm run verify`)

## Coding standards

- TypeScript strict mode must pass.
- Fail-closed behavior is mandatory for execution-critical paths.
- Keep adapter boundaries stable and provider-agnostic.
- Never remove safety checks without explicit replacement.
- Do not commit local runtime artifacts (`cache/`, `.zerog-memory/`, `reconciliation-logs/`).

## Adapter extension rules

- New adapters must implement contracts in `agent-sdk/src/adapters.ts`.
- Adapters must return deterministic, serializable outputs.
- Add one happy-path and one failure-path test for each adapter.
- Document required env vars in `.env.example` and README.

## 0G Storage SDK (optional)

The official `@0gfoundation/0g-storage-ts-sdk` is **not** a root dependency because its `ethers` peer conflicts with Hardhat’s peer range. Default `npm install` stays clean; remote storage uses a runtime dynamic import. Operators and CI patterns are documented in [docs/zerog-storage-sdk-peer.md](docs/zerog-storage-sdk-peer.md) and [docs/zerog-storage-operators.md](docs/zerog-storage-operators.md). Optional manual Vitest load check: `GCTL_ZEROG_SDK_MANUAL_SMOKE=1 npm run test:zerog-sdk-legacy-smoke` (only after installing the SDK on a coherent tree; see docs).

## RFC process

Use RFCs for major changes:
- adapter surface changes
- policy DSL schema evolution
- security model changes
- execution semantics changes

Draft location: `docs/rfcs/`.

## AI-assisted delivery (optional)

You may use gstack and GSD in your own environment for planning and execution. This repository does not ship a vendored workflow tree; use **Development setup** and **Contribution workflow** above, and match the PR template verification steps (`npm run verify` and any demos your change affects).
