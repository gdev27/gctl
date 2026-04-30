# Frontend Product Contract

## Product intent
The gctl frontend is the consumer-facing control plane for policy-constrained autonomous execution. It must make trust and reliability visible while keeping the happy path fast for first-time operators.

## Primary personas
- **Treasury operator (new):** wants guided setup and confidence that actions are safe.
- **Protocol operator (advanced):** needs quick status scanning, filtering, and direct evidence drill-down.
- **Compliance reviewer:** needs policy and execution proof artifacts without deep code context.

## Core journeys
1. **Onboarding and readiness**
   - User lands on dashboard and runs environment readiness checks.
   - User sees pass/fail status for indexer connectivity and data freshness.
2. **Policy understanding**
   - User browses active policies, hashes, and URIs.
   - User can identify stale or inactive policy records quickly.
3. **Run monitoring**
   - User reviews deterministic and swarm run outcomes with terminal states.
   - User sees fail-closed alerts and can pivot to run details.
4. **Evidence review**
   - User inspects identity and attestation surfaces in one place.
   - User can trace from a run to its audit path and proof metadata.
5. **Operations and settings**
   - User configures endpoints and operating mode with clear defaults.
   - User can tell whether the environment is in demo-safe or production mode.

## Information architecture
- **Dashboard:** high-signal overview, alerts, and status cards.
- **Onboarding:** environment checks and guided first-run workflow.
- **Policies:** policy inventory and integrity context.
- **Runs:** deterministic and swarm run center with status timelines.
- **Swarm:** role-wise view of planner/researcher/critic/executor loop.
- **Evidence:** trust artifacts (identity, audit, attestation pointers).
- **Settings:** endpoint and product behavior configuration.

## UX principles
- **Trust is visible:** every decision view includes reason and source.
- **Progressive disclosure:** simple defaults first, deep details on demand.
- **Fast operations:** filterable lists, consistent state colors, keyboard-friendly controls.
- **Graceful failure:** explicit fail-closed messaging with recovery actions.

## Ops API trust envelope contract
- Every `/api/ops/*` payload returns:
  - `source`: `live` or `fallback`
  - `trustStatus`: `healthy`, `degraded`, or `fallback`
  - `reasonCode`: stable machine-readable cause when not healthy
  - `recoveryAction`: operator action text to restore healthy state
- `source=fallback` and `trustStatus=fallback` must never be rendered as production-live telemetry.
- `trustStatus=degraded` is reserved for partial trust conditions (for example stale data) where connectivity exists but evidence confidence is reduced.

## Visual system contract
- **Aesthetic direction:** calm institutional cockpit. The brand voice is "policy-constrained autonomy you can prove" — confident, never decorative.
- **Foundation:** Vite 6 + React 18 SPA in `web/` with Tailwind v3 (`web/tailwind.config.js`, HSL CSS-variable tokens declared in `web/src/index.css`) and shadcn/ui (New York, slate base) primitives in `web/src/components/ui/*`. The `cn` helper in `web/src/lib/utils.js` is the single class composer.
- **Brand assets:** `web/src/components/site/GctlMark.jsx` ships an inline-SVG mark that adapts via `currentColor`. No raster brand assets in components.
- **Color tokens (semantic, both themes):** the standard shadcn HSL palette — `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, plus `chart-1..5`. Tokens live in `web/src/index.css`. No hardcoded hex/rgba colors are allowed in components.
- **Type & spacing:** the bundled `font-sans` + `font-serif` (system-derived) and `font-mono` for hashes/IDs. Spacing follows Tailwind's default 4px scale.
- **Iconography & charts:** `lucide-react` is the canonical icon set; trust badges live in `web/src/components/trust/SourceBadge.jsx` + `FallbackBanner.jsx`. Trends use Recharts.
- **Information architecture:** `/`, `/docs`, and `/concepts` are the public marketing site; everything operator-facing lives under `/dashboard`, `/policy-builder`, `/playground`, `/swarm`, `/alerting`, `/explorer`, `/team`, and `/onboarding`, all wrapped by `AppLayout`.
- **App shell:** every operator screen renders inside `web/src/components/app/AppLayout.jsx` with a fixed side nav and `MobileNav` drawer on small viewports.
- **Command palette:** `Ctrl/Cmd+K` opens `web/src/components/app/CommandPalette.jsx` (cmdk + shadcn).
- **Routing:** react-router v6 (`BrowserRouter`) drives navigation; data fetching is `@tanstack/react-query` keyed on entity name.
- **Auth:** the SPA ships with a default local admin operator (`web/src/api/gctlClient.js#auth`) so screens render without a remote login. Role swaps persist to `localStorage` for permission-aware UX.
- **Motion:** framer-motion is available for subtle entrance animation; respect `prefers-reduced-motion` for any new motion.
- **Accessibility:** Radix primitives provide focus trap, escape-close, and ARIA roles; both themes (default `dark` on `<html>`) are validated for WCAG AA contrast.
- **Control contract:** shared button/input/select/table/checkbox/radio/switch/tabs/tooltip/popover/dialog/sheet/dropdown/command/scroll-area/slider/separator/skeleton primitives are mandatory for all routes; no raw browser-default form controls on primary flows.
- **Evidence contract:** policy IDs, hashes, ENS subnames, attestations, and audit paths are rendered in monospace with copy affordances (`web/src/components/trust/IdentityEvidencePanel.jsx`).
- **Data source contract:** whenever a `/api/ops/*` envelope reports `source: fallback`, pages must display `FallbackBanner` and a `SourceBadge` with the demo state so synthetic data is never mistaken for live state.

## Success metrics
- **Activation:** first successful onboarding completion under 2 minutes.
- **Comprehension:** users can explain allow/deny outcomes from UI without logs.
- **Operational speed:** median time to locate a failed run under 30 seconds.
- **Reliability perception:** no ambiguous terminal-state messaging in critical views.
