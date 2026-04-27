# Contributing

Thanks for contributing to Institutional Policy OS v2.

## Development setup

1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - `cp .env.example .env`
3. Run local quality checks:
   - `npm run test`
   - `npm run typecheck`

## Contribution workflow

1. Open an issue describing bug, feature, or adapter proposal.
2. Fork and create a focused branch (`feat/adapter-foo` or `fix/reconcile-timeout`).
3. Add tests with any behavior change.
4. Update docs if integration or workflow semantics changed.
5. Submit PR with:
   - clear problem statement
   - architecture impact
   - verification steps

## Coding standards

- TypeScript strict mode must pass.
- Fail-closed behavior is mandatory for execution-critical paths.
- Keep adapter boundaries stable and provider-agnostic.
- Never remove safety checks without explicit replacement.

## Adapter extension rules

- New adapters must implement contracts in `agent-sdk/src/adapters.ts`.
- Adapters must return deterministic, serializable outputs.
- Add one happy-path and one failure-path test for each adapter.
- Document required env vars in `.env.example` and README.

## RFC process

Use RFCs for major changes:
- adapter surface changes
- policy DSL schema evolution
- security model changes
- execution semantics changes

Draft location: `docs/rfcs/`.

## AI workflow conventions

This repo uses gstack and GSD together for high-quality delivery:

- Workflow index: `devtools/agent-workflows/README.md`
- Phase loop: `devtools/agent-workflows/PHASE_PLAYBOOK.md`
- Quality gates: `devtools/agent-workflows/QUALITY_GATES.md`
- Command routing: `devtools/agent-workflows/COMMAND_MAP.md`

