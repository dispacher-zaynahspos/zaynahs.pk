# scripts/ — ops and generators

## Purpose
Node scripts run from the CLI (`npm run ...`): setup, deploy, migrations, bulk store ops,
generators. Nothing here is imported by the app.

## Belongs here
| Pattern | Purpose |
|---|---|
| `gen-worker-config.mjs` | generate per-brand Wrangler config (no hardcoded domains) |
| `snapshot.mjs` | capture / compare rendered HTML baseline (`--out`, `--compare`, `--ignore-hash`) |
| `clone-setup.mjs` | one-command clone setup orchestrator |
| `check-setup-sync.mjs` | prebuild guard: migrations ↔ master schema ↔ env docs |
| `stores-bulk-ops.mjs` | multi-store push / env sync / CF cache / purge / verify |
| `cloudflare-*.mjs`, `update-cf-cache-rules.mjs`, `lib/cf-cache-rules.js` | Cloudflare config |
| `init-db.mjs`, `setup-triggers.mjs`, `apply-*.mjs` | database setup |
| `create-admin.mjs`, `seed-brand.mjs` | brand bootstrap |
| `apply-security-lock.mjs` | RLS/security lock + verify |
| `snapshots/` (planned) | before/after HTML snapshots |

## Does not belong here
- Runtime app code → `lib/`
- Secrets (read from `.env.local` / `env-backups/`, never commit)

## Conventions
- Resolve the store from `--store=<slug>` or `env-backups/<slug>.env.local`; never hardcode a domain.
- Idempotent: safe to re-run.
- Print names, never secret values.
