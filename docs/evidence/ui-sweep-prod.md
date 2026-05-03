# Production UI sweep (gctl.vercel.app)

- **When:** 2026-05-03
- **Runner:** `node scripts/ui-sweep-prod.mjs` (Playwright Chromium)
- **Result:** PASS; all listed routes loaded; no hard navigation failures; no unfiltered console errors after excluding known CSP/font and Radix dialog a11y dev warnings.

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

## Post git history rewrite (force-push `main`)

- Re-ran `node scripts/ui-sweep-prod.mjs`: PASS.
- `GET https://gctl.vercel.app/api/ops/overview`: `source: "live"`, healthy.

Pre-rewrite full-object backup (local, outside repo): `../gctl-pre-filter-coauthor.bundle` next to the repo folder. Tree at previous tip `main^{tree}` matched after message-only filter (`5997b34340a49621357a6a2a2c4a20b25292872f`) before the small follow-up commit adding `scripts/run_filter_repo_strip_cursor.py`.
