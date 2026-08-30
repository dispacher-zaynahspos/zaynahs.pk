# 22 — Credentials Management

## RULE 8 — Never hardcode credentials in any file (STRICTLY ENFORCED)
- No tokens, API keys, passwords, or project refs in `.ts`, `.tsx`, `.sql`, `.md`, `.json`, `.js` files.
- Every store's credentials go ONLY in its own `.env.local` (or `env-backups/<store>.env.local`) — NEVER shared across stores.
- GitHub blocks pushes containing secrets — verify with:
  ```bash
  rg "sbp_|ghp_|cfut_" --glob '!.env*' --glob '!.git'
  # must return 0 results
  ```

## RULE CRED1 — Each store has COMPLETELY separate credentials (MANDATORY — NEVER SHARE)
⚠️ **Absolute rule**: Code = universal (same for all stores). Credentials = 100% separate per store. Neither rule can ever be broken.

### Must be separate per store
| Credential | Separate? | Notes |
|------------|-----------|-------|
| `SUPABASE_PROJECT_REF` | ✅ UNIQUE | Different DB per store |
| `SUPABASE_MGMT_TOKEN` (`sbp_...`) | ✅ UNIQUE | Different Supabase account |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ UNIQUE | Different project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ UNIQUE | Different project key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ UNIQUE | Different project key |
| `CLOUDFLARE_ZONE_ID` | ✅ UNIQUE | Different domain per store |
| `CLOUDFLARE_API_TOKEN` (`cfut_...`) | ✅ UNIQUE | Different CF account/token |
| `CF_ACCOUNT_ID` | ✅ UNIQUE | Different CF account |
| `VERCEL_TOKEN` | May be shared only if same Vercel account | — |
| `VERCEL_PROJECT_NAME` | ✅ UNIQUE | Must be unique even if token shared |
| `GITHUB_TOKEN` (`ghp_...`) | ✅ UNIQUE | Different GitHub account |
| `NEXT_PUBLIC_SITE_URL` | ✅ UNIQUE | Different domain |

### Shared across ALL stores (same value everywhere)
| Credential | Value | Why |
|------------|-------|-----|
| `REVALIDATE_SECRET` | `zaynahs_secret_cache_revalidate_2026` | Must match Supabase triggers (RULE D8) |

### Mandatory file structure
```
env-backups/
  totvogue.env.local      ← TotVogue ONLY credentials
  zaynahs.env.local       ← Zaynahs ONLY credentials
  minimahal.env.local     ← MiniMahal ONLY credentials
  littlemister.env.local  ← LittleMister ONLY credentials
.env.local                ← Current working store credentials
```

### Agent rules (STRICT)
1. Never copy credentials from one store's `env-backups/` file to another.
2. After any token rotation: update `env-backups/<store>.env.local` + the Vercel dashboard for THAT store only.
3. Before every deploy: run `node scripts/post-deploy-fix.mjs` (auto-reads ALL env-backups, purges ALL Cloudflare zones + Vercel ISR cache) via the mandatory synchronous bash chain in [00-prime-directives.md](00-prime-directives.md).
4. Verify no cross-contamination: `rg "CLOUDFLARE_ZONE_ID" env-backups/` — every file must show a DIFFERENT value.
5. Verify no secrets in code: `rg "sbp_|ghp_|cfut_|eyJ" --glob '*.ts' --glob '*.tsx' --glob '*.mjs' --glob '*.sql'` — must return 0 results.
6. `cfk_` token = ALWAYS WRONG — only `cfut_` tokens work with Bearer auth.

### Multi-store purge system (MANDATORY after every deploy)
```bash
node scripts/post-deploy-fix.mjs
# Auto-reads .env.local + ALL env-backups/*.env.local
# 1. Vercel ISR cache purge (requires VERCEL_TOKEN + VERCEL_PROJECT_NAME)
# 2. Purges Cloudflare for EVERY store zone
# 3. Verifies /api/revalidate → {revalidated: true}
# 4. Verifies all pages → HTTP 200
```
If any zone fails → fix the token immediately. NEVER skip a failed zone.

## RULE VERCEL1 — VERCEL_PROJECT_NAME mandatory in all env-backups
**Root cause**: Vercel has its OWN internal ISR cache, separate from Cloudflare edge cache. Both must be purged after every deploy.

**Why this issue happens**: if `VERCEL_PROJECT_NAME` is missing from `.env.local` / `env-backups/<store>.env.local`, `post-deploy-fix.mjs` skips the Vercel purge (`[1/4] SKIPPED`) → stale HTML persists on Vercel's server for the first request.

**Fix (permanent)**: every `env-backups/<store>.env.local` MUST have:
```
VERCEL_TOKEN=vcp_...          ← Vercel account token
VERCEL_PROJECT_NAME=<name>    ← Exact project name from vercel.com dashboard
```

### Current values (all stores)
| Store | VERCEL_PROJECT_NAME |
|-------|---------------------|
| TotVogue | `zaynahsestore-tv` |
| Zaynahs | `zaynahsestore-tv-main` |
| MiniMahal | `mini-mahal-e-store` |
| LittleMister | `eestore` |

### Verify before every deploy
```bash
grep "VERCEL_PROJECT_NAME" env-backups/*.env.local
# every file MUST show a value — no empty/missing lines
```

### Agent rule
- New store setup → immediately add `VERCEL_PROJECT_NAME` to its `env-backups/` file.
- `post-deploy-fix.mjs` shows `SKIPPED` for Vercel → STOP and fix before continuing.
- NEVER mark a deploy complete if the Vercel purge was SKIPPED.

## Clone / setup from scratch
1. Copy `.env.example` → `.env.local`, fill in your store's Supabase project details.
2. Backup: `cp .env.local env-backups/<yourstore>.env.local`.
3. `node scripts/init-db.mjs` to apply `SUPER_MASTER_SCHEMA.sql`.
4. `node scripts/run-migration.mjs supabase/migrations/<filename>.sql` for individual migrations.
5. Fill in `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (unique per store).
6. `npm run dev` — everything works.
