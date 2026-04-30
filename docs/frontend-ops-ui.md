# Frontend Ops UI

## Overview
The frontend lives in `web/` (Vite + React 18 SPA, deployed at https://gctl.vercel.app) and provides the consumer-facing operations surface for gctl:
- onboarding readiness checks (`/onboarding`),
- policy browsing and authoring sandbox (`/policy-builder`, `/playground`),
- deterministic/swarm run monitoring (`/dashboard`, `/swarm`, `/explorer`),
- alerting and team views (`/alerting`, `/team`),
- evidence views via the trust-envelope side panels.

## Local run
1. Start the indexer API in one terminal:
   ```bash
   npm run indexer:api
   ```
2. Start the frontend in another terminal:
   ```bash
   npm run web:dev
   ```
3. Open the URL printed by Vite (defaults to `http://localhost:5173`).

The Vercel Functions in `api/ops/*` and `api/functions/debate-policy.js` only run on Vercel (preview/prod). In local dev, `web/src/api/gctlClient.js` falls back to seeded `localStorage` data with explicit fallback envelopes so the UI stays inspectable.

## Quality gates
- `npm run web:lint`
- `npm run web:build`
- `npm run web:typecheck` (advisory — pre-existing JSX-on-shadcn type noise; not currently a merge gate)

## API contract notes
- Vercel Functions live under `api/ops/*` and `api/functions/*`.
- `api/ops/*` reads the indexer (via `INDEXER_URL`) and normalizes operator-facing payloads.
- If the indexer is unavailable, deterministic fallback data from `api/_lib/mock-data.js` is returned so demos remain inspectable.
- Every payload includes the trust envelope: `source` (`live` | `fallback`), `trustStatus` (`healthy` | `degraded` | `fallback`), optional `reasonCode`, and optional `recoveryAction`.
- The SPA renders `web/src/components/trust/SourceBadge.jsx` plus `FallbackBanner.jsx` whenever `trustStatus !== healthy`.
