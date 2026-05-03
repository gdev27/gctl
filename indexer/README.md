# gctl indexer HTTP API

Express service that exposes policy and workflow snapshots for the Vercel ops layer (`api/_lib/data.js` fetches `INDEXER_URL`).

## Routes

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | Liveness |
| GET | `/fund/:ens/policies` | JSON array |
| GET | `/workflows` | JSON array |
| GET | `/alerts/fail-closed` | Fail-closed subset |

## Local

```bash
npm run indexer:api
```

Default: `http://localhost:4300` (`PORT` / `INDEXER_PORT` override).

## State

Snapshots use `indexer/index-state.json` by default, or **`INDEXER_STATE_PATH`** for a mounted file in Docker/Fly.

---

## Deploy to Fly.io (no local Docker)

Fly builds the image remotely.

### Option A — GitHub Actions (recommended)

1. **Fly.io** (one-time on your laptop): install [flyctl](https://fly.io/docs/hands-on/install-flyctl/), run `fly auth login`, then create an **org** deploy token (CI must create apps; `fly tokens create deploy` without `-a` needs an existing app and fails with “Could not find App”):
   ```bash
   fly orgs list
   fly tokens create org -o personal
   ```
   Replace `personal` with your org slug from `fly orgs list`. Copy the token.

2. **GitHub** (repo → **Settings → Secrets and variables → Actions**): add **`FLY_API_TOKEN`** with that value.

3. **Actions** → **Deploy gctl indexer (Fly.io)** → **Run workflow** → type a **globally unique** app name (e.g. `gctl-indexer-gdev27`).

4. **Vercel only** (your step): set **`INDEXER_URL`** = `https://<that-app-name>.fly.dev` (no trailing slash). Redeploy the Vercel project.

Health check: `https://<that-app-name>.fly.dev/health`

### Option B — Your machine (flyctl + login)

From repo root:

```bash
chmod +x scripts/deploy-indexer.sh
./scripts/deploy-indexer.sh YOUR_UNIQUE_APP_NAME
```

Windows (PowerShell):

```powershell
.\scripts\deploy-indexer.ps1 -AppName YOUR_UNIQUE_APP_NAME
```

### Option C — Docker on your machine

```bash
npm run indexer:docker:build
docker run --rm -p 8080:8080 -e PORT=8080 gctl-indexer
```

---

## After deploy

An empty indexer returns `[]` for policies/workflows until you populate `index-state.json` (run demos locally, copy the file to a volume, or add ingestion later).
