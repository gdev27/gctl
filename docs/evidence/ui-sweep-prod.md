# Production UI sweep (gctl.vercel.app)

- **When:** 2026-05-03
- **Runner:** `node scripts/ui-sweep-prod.mjs` (Playwright Chromium)
- **Result:** PASS — all listed routes loaded; no hard navigation failures; no unfiltered console errors after excluding known CSP/font and Radix dialog a11y dev warnings.

## Routes exercised

`/`, `/docs`, `/concepts`, `/dashboard` (tab clicks), `/onboarding`, `/dashboard/agents` (new agent dialog open/escape), `/policy-builder`, `/playground`, `/swarm`, `/alerting`, `/explorer`, `/team` (invite if present), unknown path for 404 shell, `Ctrl+K` command palette, mobile viewport `/dashboard`.

## CSP follow-up

`vercel.json` was updated to allow Google Fonts stylesheets: `style-src` includes `https://fonts.googleapis.com`. Redeploy Vercel for fonts to load without browser console CSP refusals in real browsers.

## Re-run

```bash
npx playwright install chromium
node scripts/ui-sweep-prod.mjs
```

Optional: `UI_SWEEP_BASE=https://preview-url.vercel.app node scripts/ui-sweep-prod.mjs`
