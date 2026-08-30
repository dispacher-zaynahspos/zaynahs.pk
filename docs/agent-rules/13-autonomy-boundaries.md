# 13 — Autonomy Boundaries (Agent Permissions)

## ✅ Auto-allowed (no confirmation needed)
- Lint/type fixes
- Non-destructive DB reads
- Local build/test
- Feature-branch commit + push
- Preview deploy

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

> Cross-reference: [06-git-github.md](06-git-github.md) (branch/push rules), [05-database-supabase.md](05-database-supabase.md) (destructive query rules), [22-credentials-management.md](22-credentials-management.md) (secrets).
