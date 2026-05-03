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

## Deploy on Render (free tier, no Fly billing)

Use this if you want a **real `INDEXER_URL`** without Fly. Tradeoffs: **cold starts** after idle, **free tier limits**; fine for demos.

### Dashboard (what to change on the “Configure” screen)

1. **Name:** use something like **`gctl-indexer`** (not `gctl`) so it’s obvious this service is only the indexer API.
2. **Language / runtime:** change **Node** → **Docker** (Render’s docs: set language to Docker even if the app is Node inside the image).
3. **Dockerfile path:** `Dockerfile.indexer` (repo root).
4. **Branch:** `main` (or your default branch).
5. Scroll to **Instance type** → choose **Free**.
6. **Advanced** → **Health check path:** `/health`.
7. Create / deploy and wait until **Live**. Your base URL will look like `https://gctl-indexer.onrender.com` (exact host is on the service page).

### Vercel

Set **`INDEXER_URL`** to that **https origin** (no trailing slash), e.g. `https://gctl-indexer.onrender.com`. Set **`FUND_ENS_NAME`** if needed. Redeploy Vercel.

### Blueprint (optional)

Repo root **`render.yaml`** defines the same Docker web service; you can apply it from Render as a **Blueprint** if you prefer infrastructure-as-code.

---

## Deploy to Fly.io (no local Docker)

Fly builds the image remotely.

### Option A: GitHub Actions (recommended)

1. **Fly.io** (one-time on your laptop): install [flyctl](https://fly.io/docs/hands-on/install-flyctl/), run `fly auth login`, then create an **org** deploy token (CI must create apps; `fly tokens create deploy` without `-a` needs an existing app and fails with “Could not find App”):
   ```bash
   fly orgs list
   fly tokens create org -o personal
   ```
   Replace `personal` with your org slug from `fly orgs list`. Copy the token.

2. **GitHub** (repo → **Settings → Secrets and variables → Actions**): add **`FLY_API_TOKEN`** with that value.

3. **Actions** → **Deploy gctl indexer (Fly.io)** → **Run workflow** → type a **globally unique** app name (e.g. `gctl-indexer-gdev27`). Leave **fly_org** as `personal` unless `fly orgs list` shows a different slug (the workflow passes `--org` to `fly apps create`; without it, CI can skip creation and deploy fails with “app not found”).

4. **Vercel only** (your step): set **`INDEXER_URL`** = `https://<that-app-name>.fly.dev` (no trailing slash). Redeploy the Vercel project.

Health check: `https://<that-app-name>.fly.dev/health`

### Option B: Your machine (flyctl + login)

From repo root:

```bash
chmod +x scripts/deploy-indexer.sh
./scripts/deploy-indexer.sh YOUR_UNIQUE_APP_NAME
```

Windows (PowerShell):

```powershell
.\scripts\deploy-indexer.ps1 -AppName YOUR_UNIQUE_APP_NAME
```

### Option C: Docker on your machine

```bash
npm run indexer:docker:build
docker run --rm -p 8080:8080 -e PORT=8080 gctl-indexer
```

---

## After deploy

An empty indexer returns `[]` for policies/workflows until you populate `index-state.json` (run demos locally, copy the file to a volume, or add ingestion later).
