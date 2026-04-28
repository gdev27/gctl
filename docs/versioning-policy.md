# Versioning Policy

gctl uses semantic versioning for framework packages and interfaces.

## SemVer rules

- **MAJOR**: breaking changes to adapter interfaces, policy graph schema, or execution receipts.
- **MINOR**: backwards-compatible features (new optional fields, new adapters, new demos).
- **PATCH**: bug fixes, security patches, and documentation corrections.

## Stability guarantees

- `agent-sdk/src/adapters.ts` is the canonical compatibility contract.
- New fields must be additive before becoming required.
- Deprecated fields must remain for at least one minor release.

## Release checklist

1. All tests pass (`npm run test`, `npm run typecheck`).
2. Changelog entries include migration notes in `CHANGELOG.md`.
3. Docs and examples are updated for any new adapter or runtime requirement.
4. Security-sensitive changes include explicit risk notes in PR description.

