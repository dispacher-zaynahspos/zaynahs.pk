# 13 — Autonomy Boundaries (Agent Permissions)

## ✅ Auto-allowed (no confirmation needed)
- Lint/type fixes
- Non-destructive DB reads
- Local build/test
- Feature-branch commit + push
- Preview deploy
- Autonomous store clone setup via CLI & APIs (RULE CLONE1 — Schema, Webhooks, Cloudflare rules, Vercel sync)

## ⚠️ Confirm-first (explain, then proceed)
- Schema migration
- Production deploy
- Payment logic change
- Bulk data update

## ❌ Never auto (always requires explicit human approval)
- `DROP TABLE`
- Delete production data without backup
- Force-push `main`
- Expose or commit secrets
- Multi-store push and deployment across all project remotes/stores (`git push` to all remotes / Vercel production deploy across all stores) without explicit user command (e.g. "push and deploy on all projects"). Always fix and verify locally first.

> Cross-reference: [06-git-github.md](06-git-github.md) (branch/push rules), [07-deployment-vercel-cloudflare.md](07-deployment-vercel-cloudflare.md) (deployment rules), [05-database-supabase.md](05-database-supabase.md) (destructive query rules), [22-credentials-management.md](22-credentials-management.md) (secrets).
