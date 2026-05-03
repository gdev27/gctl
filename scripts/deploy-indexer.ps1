# Deploy indexer to Fly.io (requires flyctl + fly auth login).
# Usage: .\scripts\deploy-indexer.ps1 -AppName gctl-indexer-yourname
param(
  [Parameter(Mandatory = $true)]
  [string] $AppName
)
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$flyexe = (Get-Command flyctl -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue)
if (-not $flyexe) { $flyexe = (Get-Command fly -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue) }
if (-not $flyexe) {
  Write-Error "Install flyctl: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
}

& $flyexe apps create $AppName 2>$null
if ($LASTEXITCODE -ne 0) { }

& $flyexe deploy --config fly.indexer.toml --remote-only --app $AppName
Write-Host ""
Write-Host "Set on Vercel: INDEXER_URL=https://$AppName.fly.dev"
