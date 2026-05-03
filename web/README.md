# gctl Web

This is the Vite + React 18 operator console for gctl. It includes the public landing pages, policy builder, playground, swarm view, dashboard, explorer, team controls, alerting, onboarding readiness, and trust-evidence panels.

## Run Locally

From the repository root:

```bash
npm ci --prefix web
npm run web:dev
```

Or from this directory:

```bash
npm ci
npm run dev
```

## Environment

The frontend has no required browser-exposed environment variables for the submission demo. See `web/.env.example` for the public env boundary. Same-origin `/api/*` calls are served by Vercel Functions in preview/production; local Vite-only development falls back to explicit demo envelopes so seeded data is not mistaken for live telemetry.

**Optional OpenAI (multi-agent debate):** In Policy Builder → “Generate via AI debate”, expand “Optional: your OpenAI key (BYOK)” to send your key with the request (HTTPS to your deployment only; not stored on the server). Alternatively set `OPENAI_API_KEY` / `OPENAI_MODEL` on Vercel for a host-managed key.

## Quality Gates

```bash
npm run web:lint
npm run web:typecheck
npm run web:build
```
