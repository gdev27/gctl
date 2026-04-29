## Deploy Configuration (configured by /setup-deploy)
- Platform: vercel
- Production URL: https://gctl.vercel.app
- Deploy workflow: .github/workflows/deploy-vercel.yml
- Deploy status command: gh run list --workflow "Deploy Vercel" --limit 5 --json workflowName,status,conclusion,headBranch,headSha,url
- Merge method: squash
- Project type: web app
- Post-deploy health check: https://gctl.vercel.app

### Custom deploy hooks
- Pre-merge: npm run web:typecheck && npm run web:test && npm run web:lint && npm run web:format:check
- Deploy trigger: GitHub Actions workflow on push to main/master
- Deploy status: gh run list --workflow "Deploy Vercel" --limit 5 --json workflowName,status,conclusion,headBranch,headSha,url
- Health check: curl -I https://gctl.vercel.app (currently returns 401 due Vercel access protection)
