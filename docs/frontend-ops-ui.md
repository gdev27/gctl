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
- `npm run web:typecheck`

## Live ops dashboard (Vercel + indexer)

Ship the indexer with Docker and optional Fly.io — see **`indexer/README.md`** (includes `npm run indexer:docker:build`, `fly deploy --config fly.indexer.toml`, and wiring **`INDEXER_URL`** + **`FUND_ENS_NAME`** on Vercel).

Populate the indexer’s backing store using your normal pipeline (demos, ingestion, etc.); empty responses still return live HTTP with empty arrays, while the Vercel layer may merge mock fallbacks when needed.

## API contract notes
- Vercel Functions live under `api/ops/*` and `api/functions/*`.
- `api/ops/*` reads the indexer (via `INDEXER_URL`) and normalizes operator-facing payloads.
- If the indexer is unavailable, deterministic fallback data from `api/_lib/mock-data.js` is returned so demos remain inspectable.
- Every payload includes the trust envelope: `source` (`live` | `fallback`), `trustStatus` (`healthy` | `degraded` | `fallback`), optional `reasonCode`, and optional `recoveryAction`.
- The SPA renders `web/src/components/trust/SourceBadge.jsx` plus `FallbackBanner.jsx` whenever `trustStatus !== healthy`; this includes degraded live data and fallback demo data.

### `POST /api/functions/debate-policy`

- Body: `{ "useCase": string (≥5 chars), "openaiApiKey"?: string, "openaiModel"?: string }` (snake_case `openai_api_key` / `openai_model` is also accepted).
- If `OPENAI_API_KEY` is set in Vercel env, the host key is used when the client omits `openaiApiKey`.
- If the user supplies `openaiApiKey` in the Policy Builder dialog (BYOK), that key is used **only for that request** (not persisted server-side). Invalid keys are ignored and the flow falls back to env key or deterministic synthesis.
- Do **not** expose `INDEXER_URL` or other server secrets via `VITE_*` or user-editable indexer URLs from the browser: arbitrary URLs from clients would create SSRF risk if proxied from Functions. Keep indexer configuration in Vercel env.
