# Phase N/A — UI Review

**Audited:** 2026-04-28
**Baseline:** abstract 6-pillar standards + `docs/frontend-product-contract.md`
**Screenshots:** not captured (no dev server detected on ports 3000/5173/8080)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Product-specific language is strong, but some feedback copy remains generic and non-contextual. |
| 2. Visuals | 2/4 | Visual hierarchy is consistent but too card-uniform, so critical actions and risks are under-emphasized. |
| 3. Color | 2/4 | Token palette exists, but many hardcoded colors bypass tokens and weaken consistency guarantees. |
| 4. Typography | 3/4 | Type scale is mostly coherent across pages with predictable heading/body/mono usage. |
| 5. Spacing | 2/4 | Spacing tokens are present, but repeated inline pixel overrides create drift from the scale. |
| 6. Experience Design | 2/4 | Loading/empty states exist, but error and interaction handling are incomplete for trust-critical flows. |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Silent fallback to mock data in failed API fetches** — operators can be shown synthetic data during outages and make unsafe decisions — replace silent fallback with explicit error state + "demo data" badge and source attribution in each trust-critical view.
2. **No robust mobile drawer interaction contract** — small-screen users can keep background content active while nav is open, reducing task focus and accessibility — add backdrop, `Escape` close, focus trap, and body scroll lock for nav open state.
3. **Design-token bypass via hardcoded colors and inline spacing** — visual consistency will regress as pages scale — migrate hardcoded hex/rgba and inline pixel values into named CSS tokens/utilities and enforce with lint/check rules.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

- **WARNING:** Copy generally matches trust-oriented language in the product contract and avoids empty buzzwords across primary journeys (`apps/web/app/page.tsx`, `apps/web/app/runs/page.tsx`, `apps/web/app/evidence/page.tsx`).
- **WARNING:** Some user feedback remains low-context and can be made more action-oriented (e.g., "Settings saved for this browser profile." and generic "Retry"), especially in failure paths where next action clarity matters (`apps/web/app/settings/page.tsx`, `apps/web/app/error.tsx`).

### Pillar 2: Visuals (2/4)

- **WARNING:** Repeated use of visually similar `.card` blocks for KPIs, warnings, and routine content flattens hierarchy, making urgent fail-closed attention less salient than it should be (`apps/web/app/page.tsx`, `apps/web/app/runs/page.tsx`, `apps/web/app/globals.css`).
- **WARNING:** Trust-signaling elements exist (status pills, evidence links), but no stronger visual escalation pattern is defined for critical risk states beyond color/text (`apps/web/components/status-pill.tsx`, `apps/web/app/runs/[runId]/page.tsx`).

### Pillar 3: Color (2/4)

- **WARNING:** Core palette tokens are defined (`--accent`, `--warn`, `--bad`, etc.), which is a strong foundation (`apps/web/app/globals.css`).
- **WARNING:** Multiple hardcoded colors and gradients bypass semantic tokens (e.g., `#24314f`, `#6f9fff`, `#5b8fff`, `#5170b4`, direct `rgba(...)` usage), increasing maintenance risk and weakening theme consistency guarantees (`apps/web/app/globals.css`).

### Pillar 4: Typography (3/4)

- **WARNING:** Typography structure is coherent: clamp-based `h1`, controlled heading levels, muted secondary text, and mono for identifiers (`apps/web/app/globals.css`, `apps/web/components/page-header.tsx`).
- **WARNING:** Ad hoc inline text sizing (e.g., `fontSize: "0.76rem"`) bypasses the shared scale and can drift over time (`apps/web/components/copy-text-button.tsx`).

### Pillar 5: Spacing (2/4)

- **WARNING:** Spacing tokens (`--s-1`..`--s-7`) are consistently available and used in layout primitives (`apps/web/app/globals.css`).
- **WARNING:** Repeated inline spacing exceptions (`marginTop: 16`, `paddingLeft: 18`, `marginBottom: 4`) bypass the scale, introducing subtle inconsistency and making responsiveness behavior harder to reason about (`apps/web/app/policies/page.tsx`, `apps/web/app/runs/[runId]/page.tsx`, `apps/web/app/page.tsx`, `apps/web/components/copy-text-button.tsx`).

### Pillar 6: Experience Design (2/4)

- **BLOCKER:** Data fetch failures silently return mock fallback content, so users cannot distinguish real backend state from fallback demo content. This directly undermines trust clarity for operations decisions (`apps/web/lib/api.ts`, `apps/web/lib/mock-data.ts`).
- **WARNING:** Async pages implement loading and empty states, but local error paths are largely absent in page-level fetch flows (`apps/web/app/page.tsx`, `apps/web/app/runs/page.tsx`, `apps/web/app/onboarding/page.tsx`, `apps/web/app/policies/page.tsx`, `apps/web/app/evidence/page.tsx`).
- **WARNING:** Mobile nav toggle behavior lacks accessibility/polish primitives (no backdrop, escape-to-close, focus management), which weakens interaction quality on narrow viewports (`apps/web/components/app-shell.tsx`, `apps/web/components/side-nav.tsx`, `apps/web/app/globals.css`).
- **WARNING:** Clipboard interaction has no rejection handling or user error feedback if `navigator.clipboard` fails (`apps/web/components/copy-text-button.tsx`).

---

## Files Audited

- `docs/frontend-product-contract.md`
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/onboarding/page.tsx`
- `apps/web/app/policies/page.tsx`
- `apps/web/app/runs/page.tsx`
- `apps/web/app/runs/[runId]/page.tsx`
- `apps/web/app/swarm/page.tsx`
- `apps/web/app/evidence/page.tsx`
- `apps/web/app/settings/page.tsx`
- `apps/web/app/loading.tsx`
- `apps/web/app/error.tsx`
- `apps/web/components/app-shell.tsx`
- `apps/web/components/side-nav.tsx`
- `apps/web/components/page-header.tsx`
- `apps/web/components/empty-state.tsx`
- `apps/web/components/status-pill.tsx`
- `apps/web/components/session-banner.tsx`
- `apps/web/components/copy-text-button.tsx`
- `apps/web/lib/api.ts`
- `apps/web/lib/mock-data.ts`
