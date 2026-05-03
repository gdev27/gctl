#!/usr/bin/env bash
# Deploy indexer to Fly.io from a machine with flyctl installed and logged in.
# Usage: ./scripts/deploy-indexer.sh YOUR_UNIQUE_APP_NAME
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP="${1:-}"
if [[ -z "$APP" ]]; then
  echo "Usage: $0 <fly-app-name>"
  echo "Example: $0 gctl-indexer-jane"
  exit 1
fi
if ! command -v flyctl >/dev/null 2>&1 && ! command -v fly >/dev/null 2>&1; then
  echo "Install flyctl: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi
FLY="flyctl"
command -v flyctl >/dev/null 2>&1 || FLY="fly"
"$FLY" apps create "$APP" 2>/dev/null || true
"$FLY" deploy --config fly.indexer.toml --remote-only --app "$APP"
echo ""
echo "Set on Vercel: INDEXER_URL=https://${APP}.fly.dev"
