# Frontend Copy Style Guide

Use this guide for all `web/` product copy so the UI keeps one voice.

## Voice and tone
- Write for operators and reviewers first.
- Prefer calm, precise, and evidence-oriented language.
- Keep sentences short and actionable.
- State trust state explicitly when data is not live.

## Canonical terminology
- Use **Control Plane** for the product surface.
- Use **Run Center** (capitalized) for `/runs`.
- Use **operations** for user workflows; avoid switching between "actions" and "operations" unless technically required.
- Use **evidence records** for UI-facing trust artifacts.
- Use **attestation metadata** for attestation-specific fields.
- Use **Fallback data active:** as the prefix for fallback disclosure banners.

## Copy patterns
- **Page description:** one sentence, starts with the primary user goal.
- **Empty state description:** explain why empty + what to do next.
- **Recovery text:** imperative and specific (for example, "Open Settings and verify connector health.").
- **Buttons:** use clear verb + object labels (for example, "Open Run Center", "Open readiness checks").

## Avoid
- Vague terms like "random", "magic", "stuff", or "just".
- Mixed casing for product surfaces (for example, "run center" vs "Run Center").
- Ambiguous trust language that could make fallback data look live.

## Enforcement
- Reviewers should grep for non-canonical terms (`run center`, `actions` vs `operations`, casing drift) during PR review.
- The legacy automated `web:copy:check` was tied to the retired Next.js app and is no longer wired into CI.
