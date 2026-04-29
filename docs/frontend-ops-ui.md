# Frontend Ops UI

## Overview
The frontend lives in `apps/web` and provides the consumer-facing operations surface for gctl:
- onboarding checks,
- policy browsing and authoring sandbox,
- deterministic/swarm run monitoring,
- evidence views,
- settings and session mode controls.

## Local run
1. Start the indexer API in one terminal:
   ```bash
   npm run indexer:api
   ```
2. Start the frontend in another terminal:
   ```bash
   npm run web:dev
   ```
3. Open `http://localhost:3000`.

## Quality gates
- `npm run web:typecheck`
- `npm run web:test`
- `npm run web:build`

## API contract notes
- Frontend BFF endpoints live under `/api/ops/*`.
- BFF reads the indexer and normalizes operator-facing payloads.
- If the indexer is unavailable, deterministic fallback data is used so demos remain inspectable.
- Every BFF payload must include trust envelope fields: `source`, `trustStatus`, optional `reasonCode`, and optional `recoveryAction`.
- Dashboard and detail pages must show fallback/degraded disclosure whenever `trustStatus !== healthy`.
