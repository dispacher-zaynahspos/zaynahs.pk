# 07 — Deployment Rules (Vercel / Cloudflare)

- Deploy se pehle local build 100% pass hona chahiye.
- Preview deploy pe test karo, phir production.
- Verify env vars are synced with the dashboard before deploy.
- On failure, fix root-cause from logs — no blind retry.
- Every production deploy needs a ready rollback plan.

## RULE BULK1 — Mandatory 1-Command Multi-Store Operations Engine
All multi-store pushes, deployments, cache syncs, purges, and verifications MUST be run via the unified bulk engine:
```bash
npm run stores:all
```
This runs the complete automated pipeline across all stores in `env-backups/*.env.local`:
1. `stores:push`: Pushes commit to all store remotes in parallel.
2. `stores:sync-envs`: Direct Vercel REST API syncs `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`, etc. across all environments.
3. `stores:sync-cf`: Deploys standard Cloudflare cache rules (`no-cache-dynamic`, `static-assets`, `html-pages`, `supabase-images`) across all zones.
4. `stores:wait`: Polls Vercel deployment API in parallel until all builds reach `READY`.
5. `stores:purge`: Full edge purge + Next.js ISR revalidation across all stores.
6. `stores:verify`: Automated sweep verifying TTFB, Cloudflare cache HIT, 1.0s price freshness, and relational order checkout test.

Individual commands:
- `npm run stores:push`
- `npm run stores:sync-envs`
- `npm run stores:sync-cf`
- `npm run stores:wait`
- `npm run stores:purge`
- `npm run stores:verify`

Never run manual sequential multi-store steps or individual git pushes. Always use `stores:*`.

## RULE VERCEL-QUOTA — Zero Wasteful Deploys / Single Final Deploy Policy
⚠️ **Vercel Free Tier limits build time (~4–6 build hours per month per account). Repeated intermediate deploys burn the monthly quota and block the account.**
1. **Local-First Verification ALWAYS**:
   - Every feature, UI tweak, bug fix, or schema change MUST be verified locally first (`npm run prebuild`, local syntax & type verification).
   - Never push intermediate or exploratory trial-and-error commits.
2. **Batch All Changes Into ONE Final Deploy**:
   - Complete 100% of the requested task in local files first.
   - Do NOT push after every single file edit.
   - Only trigger `git push` / `npm run stores:all` as the **ONE SINGLE FINAL STEP** when everything is completely done.
3. **Save Build Minutes**:
   - If an operation is purely configuration or API-based (e.g. Supabase migrations, Cloudflare cache rules, DB triggers, Vercel env updates), perform it via API WITHOUT triggering a new Next.js production build.
   - Only code changes that alter Next.js bundles warrant a Vercel build.

## RULE AUTO1 — Agent automation flow (clone/setup)
When the user provides these 7 values (project ref ID auto-extracted from URL):
1. Supabase URL (ref auto-extracted) + service role key
2. Cloudflare zone ID + API token (`cfut_...`)
3. Vercel API token (Settings → Tokens → Create)
4. GitHub personal access token (repo + contents write)
5. Domain name

The agent automatically:
- **Supabase API**: executes `SUPER_MASTER_SCHEMA.sql` (tables, policies, bucket), creates storage bucket, creates 5 webhooks (products, categories, homepage_sections, store_settings, reviews).
- **Cloudflare API**: sets `browser_cache_ttl = 0` (Respect origin — prevents client 4h disk caching), creates 4 Cache Rules (`no-cache-dynamic`, `static-assets`, `html-pages`, `supabase-images`), 3 Page Rules (cart/checkout/my-account → bypass), DNS records (A, CNAME, TXT — all proxied/orange-cloud).
- **GitHub + Vercel API**: `git init` + commit + push (via `GITHUB_TOKEN`); `npm i -g vercel` → `vercel --prod --token=$VERCEL_TOKEN`; sets Vercel env vars via API (from `.env.local`); `vercel domains add [domain]`; auto SSL enable.
- **Verify**: cache headers (HIT/MISS/BYPASS), webhook (`revalidated:true`), CF purge API, page rules active, browser_cache_ttl verified 0.

Full details: `docs/NEW_PROJECT_SETUP_GUIDE.md#agent-automation--full-setup-flow`.

---

## RULE CLONE1 — Mandatory Autonomous Clone Setup by Agent (STRICT)
⚠️ **Never ask the user to manually configure dashboards or run setup steps.**
Whenever the user asks to clone, fork, or set up a new store:
1. **Agent collects credentials only**: If not already present in `env-backups/<store>.env.local` or `.env.local`, request ONLY the required store credentials from the user:
   * Supabase URL & Service Role Key
   * Cloudflare Zone ID & API Purge Token (`cfut_...`)
   * Vercel Project Name & Token (or CLI login)
   * Domain name
2. **Agent executes 100% autonomously via CLI & APIs**:
   * **Stage 1 (Environment)**: Sets up `.env.local` and creates `env-backups/<store>.env.local` with separate credentials (RULE CRED1).
   * **Stage 2 (Database)**: Applies `supabase/schema/SUPER_MASTER_SCHEMA.sql` directly to the new Supabase project via Management API or script.
   * **Stage 3 (Cache Webhooks)**: Creates the 5 auto-purge triggers on Supabase pointing to `https://<domain>/api/revalidate` with `REVALIDATE_SECRET=zaynahs_secret_cache_revalidate_2026`.
   * **Stage 4 (Cloudflare Caching)**: Creates the 4 Cloudflare Cache Rules and DNS records via Cloudflare API (no manual dashboard work).
   * **Stage 5 (Vercel Sync)**: Pushes environment variables to Vercel and links domain.
   * **Stage 6 (Audit & Verify)**: Executes `node scripts/post-deploy-fix.mjs` to purge all caches and verify HTTP 200 and `{ revalidated: true }`.
3. **Report to user**: Once complete, provide a concise summary showing all 6 stages verified green (`OK ✅`).

---

## RULE CLONE2 — Setup must stay 100% agent-automated & error-free after EVERY feature change (STRICT)
The user does **zero** manual setup. A fresh `clone → give credentials → agent runs A-Z` must produce a fully working store with **no errors/bugs**, forever. To keep this true as the codebase grows:

1. **Master schema is the law.** `supabase/schema/SUPER_MASTER_SCHEMA.sql` must ALWAYS be complete and current. Any feature work (including customizer phases) that adds/renames a table, column, index, view, policy, bucket, trigger, or seed row MUST update the master schema in the SAME task — with **UUID PK + snake_case + RLS on every data table** (RULE D13/D14 + rule 27). No column ships to code that isn't in the master schema.
2. **Setup guide is the law.** `docs/NEW_PROJECT_SETUP_GUIDE.md` must reflect the current agent-automated flow end-to-end: env, schema apply, RLS, storage bucket, cache rules + webhooks (RULE AUTO1/CLONE1), first-admin creation (`scripts/create-admin.mjs`, email pre-confirmed, creds from env or prompted), disable public signups, deploy, post-deploy REVOKE + purge, verify. Update it whenever any of these steps change.
3. **Agent owns RLS / UUID / cache / auth / admin creation** — never delegate a dashboard step to the user. Everything reproducible from migrations + scripts + env vars + Management/Cloudflare/Vercel APIs.
4. **Zero-error acceptance:** after an agent setup, a customer-flow + admin-flow smoke test (`/`, `/shop`, `/product/[slug]`, `/checkout`, `/admin/login`, `/admin/dashboard`) must pass with no runtime errors, no missing columns, no RLS lockouts. If a new feature could break a fresh clone, fix the schema/setup, don't patch per-store.
5. **New settings default to current look** so a fresh clone renders correctly with defaults (no undefined-driven breakage).

---

## RULE V-PROJ1 — One Vercel Project Per Store (STRICT, PERMANENT)

**Every store must have EXACTLY ONE Vercel project — the one with the custom domain linked. No duplicates. No orphans. Ever.**

### Problem this prevents
When `vercel --prod` is run from a machine without `.vercel/` config, Vercel creates a NEW duplicate project (named `zaynahsestore-tv-main` or similar) instead of deploying to the correct existing project. These orphan projects waste build minutes, confuse logs, and can accidentally capture domain redirects. **Past audit (2026-10-11) found 9 orphan projects across TotVogue + Zaynahs accounts — all deleted.**

### Rules
1. **Before any `vercel` CLI deploy**, always confirm the target project: `vercel project ls --token=$VERCEL_TOKEN` — the result must match `VERCEL_PROJECT_NAME` in `env-backups/<store>.env.local`.
2. **Never deploy via `vercel --prod` without `--project` flag** unless `.vercel/project.json` already exists and matches the correct project ID.
3. **Correct deploy command** (always explicit):
   ```bash
   vercel --prod --token=$VERCEL_TOKEN --project=$VERCEL_PROJECT_NAME
   ```
4. **After any deploy**, run `vercel project ls` and verify only ONE project with that `VERCEL_PROJECT_NAME` exists in the account.
5. **Canonical project IDs** (do not create new ones — these are the ONLY valid projects per Vercel account):

   | Store | Vercel Account | Project Name | Project ID | Live Domain |
   |-------|---------------|-------------|------------|-------------|
   | TotVogue | totvogue | `zaynahsestore-tv` | `prj_4YNXcnk6AOXQfTQeausLWgn36j6M` | `totvogue.pk` |
   | Zaynahs | zaynahs | `zaynahs-pk` | `prj_4xecB10gue1JYbovg5FbOpa2cpJd` | `zaynahs.pk` |
   | Lobo | lobo | `lobo-pk` | `prj_W0fmRcNx1RGaxtGyZ75gQ3Aqpp7V` | `lobo.pk` |
   | MiniMahal | minimahal | `mini-mahal-e-store` | `prj_uBAU5DIPpiuSlal9ENW9lJ2YkGjH` | `minimahal.com` |
   | MiniMahal | minimahal | `mini-mahal-pos` | `prj_DoQJhzAdhmy9CQjqJPdVRXrE5n5g` | `minimahal.zaynahspos.com` |
   | LittleMister | littlemister | `eestore` | `prj_fYG7cR3Nx0o2wDnjCw65jzAIMs66` | `littlemister.pk` |

   > **Rule:** A project entry in this table requires a real custom domain. Any Vercel project with only a `.vercel.app` domain is by definition an orphan and must be deleted.

6. **If a duplicate/orphan project is discovered** (no custom domain, named `zaynahsestore-tv-main` or otherwise):
   - Check it has NO custom domain: `curl /v9/projects/<id>/domains`
   - If domain present → move domain to correct project first
   - Then delete the duplicate: `curl -X DELETE /v9/projects/<id>`
   - **Never leave 2+ projects in any single Vercel account** (exception: MiniMahal which legitimately has 2 — store + POS).

---

## RULE V-GIT1 — One Git Remote Per Store (STRICT, PERMANENT)

**This monorepo uses ONE remote per store. Never add duplicate remotes for the same GitHub repo.**

### Canonical remotes (ONLY these 5)
```
origin       → totvoguepk-bot/zaynahsestore-tv     (TotVogue)
zaynahspk    → dispacher-zaynahspos/zaynahs.pk     (Zaynahs)
lobo         → infolobopk-lgtm/lobo.pk             (Lobo)
minimahal    → infominimahal-bit/mini-mahal-e-store (MiniMahal)
littlemister → littlemisterpk-cell/eestore          (LittleMister)
```

### Rules
1. **Never add a second remote pointing to the same GitHub repo** — always run `git remote -v` to check before any `git remote add`.
2. **Standard push command** (all 5 stores, one-liner):
   ```bash
   git push origin main && git push zaynahspk main && git push lobo main && git push minimahal main && git push littlemister main
   ```
3. **If duplicate remotes are found** (e.g., `infolobopk-lgtm` and `lobo` both pointing to `lobo.pk.git`), remove the alias-without-auth version: `git remote remove <duplicate>`. Keep the one with embedded credentials.
4. **Never add a `zaynahs` bare remote** (without auth token) — always use `zaynahspk` which has the embedded token.
5. **Same codebase = same commit hash on all remotes.** After every push, verify:
   ```bash
   git remote -v  # must show exactly 5 remotes, no duplicates
   ```

---

## RULE CLEANUP1 — Periodic Orphan Audit (RECURRING)

**Any time the agent does a Vercel deploy or is asked to verify project health, it MUST run an orphan audit.**

### What counts as an orphan
- Any Vercel project with **no custom domain** (only `.vercel.app`) that is not a known exception.
- Any Git remote that points to the same repo as an existing canonical remote.
- Any Vercel project whose name does not appear in the RULE V-PROJ1 canonical table.

### Audit command (quick check)
```bash
# List all projects per account and flag any without custom domains
node scripts/audit-vercel-projects.mjs
```

### Agent action on orphan discovery
1. **Immediately delete** any orphan Vercel project with no custom domain — no confirmation needed (non-destructive because it has no real traffic).
2. **Remove** any duplicate Git remote — keep canonical name from RULE V-GIT1 table.
3. **Log the deletion** to `docs/LESSONS_LEARNED.md` with date + project ID + root cause (e.g., "bare vercel deploy without --project flag").
4. **Add/update** the `RULE V-PROJ1` table if a new legitimate project is created.

### Known legitimate multi-project exception
- **MiniMahal account**: 2 projects allowed — `mini-mahal-e-store` (store) + `mini-mahal-pos` (POS). Any 3rd project in this account is an orphan.
- **All other accounts**: strictly 1 project allowed.

---

## 🛡️ RULE ROLLOUT1 — One-By-One Store Rollout vs Normal Deployments (STRICT, MANDATORY)

The active store registry is **NEVER hardcoded** — active stores are always read dynamically from `env-backups/*.env.local` (see RULE CRED-ENVBACKUP).

### 1. Scope: High-Impact ("Big Needed") vs Normal Deployments
- **BIG / CRITICAL CHANGES ("Big Needed" — 1-by-1 Gated Rollout MANDATORY):**
  Applies ONLY to high-impact architectural shifts, core edge/Cloudflare caching rule overhauls, database schema migrations affecting live data, or checkout/payment engine rewrites. For these changes, blanket deployment is forbidden; rollout proceeds strictly **ONE STORE AT A TIME (1-by-1)** through the 5-step verification gate below.
- **NORMAL / ROUTINE TASKS ("Normal Places" — Standard Apply All):**
  For normal everyday development, UI/styling fixes, copy tweaks, standard feature updates, and routine non-breaking code changes, apply changes normally across all stores without 1-by-1 gating. Do NOT waste time running heavy multi-gate verification on small routine tasks.

### 2. Rollout Sequence for High-Impact Changes (from `env-backups/`)
Enumerate active stores dynamically from `env-backups/*.env.local`:
1. **Canary / Pilot Store:** `zaynahs` (or designated pilot)
2. **Intermediate Clones:** Remaining clone stores from `env-backups/*.env.local` one by one.
3. **Flagship Store:** `totvogue` deployed last.

### 3. Five-Step Verification Protocol per Store (Mandatory Gate for High-Impact Changes)
For each store in the sequence, execute and document these 5 steps before touching the next store:

1. **Env Preflight Check:**
   Verify Vercel project environment variables (`CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`) against `env-backups/<store>.env.local`. If any is missing or invalid, **STOP and report immediately** (prevents silent targeted purge failures and stale edge cache).
2. **Deploy & Cloudflare Cache Rules:**
   Push commit to the store's git remote and verify Vercel deployment status reaches `READY`. Verify Cloudflare edge cache rules (5-min HTML edge TTL with dynamic bypass for `/cart`, `/checkout`, `/account`, `/api`, `/admin`, `/wishlist`, `/order`, auth). **NEVER execute `purge_everything`.**
3. **Live Plain URL Freshness Test (NO `?_t=` Bypass):**
   Update a test product price in DB, trigger targeted revalidation, repeatedly fetch the **plain product URL** (no query strings, no bypass headers). Measure exact elapsed time (in seconds) until the new price reflects. Record `cf-cache-status` and `x-vercel-cache`. Revert the price back and verify revert. Target: **< 10 seconds** on plain URL.
4. **Real Application Checkout Verification:**
   Execute a real application checkout (`createOrder` with customer info, address, line items). Verify the order and address appear in admin/DB. Set status to `cancelled` and delete test records.
5. **Circuit Breaker (Stop on Failure):**
   If ANY check or test fails or exhibits regressions on store `N`, **HALT IMMEDIATELY**. Do not proceed to store `N+1`. Provide the measured numbers, diagnosis, and rollback plan.

---

## RULE CF-MANDATORY — Cloudflare Cache Rules Are Non-Negotiable (STRICT)
**Post-mortem (2026-10):** 4 out of 5 stores had NO Cloudflare cache rules after clone setup, causing 2-7s TTFB (origin round-trip to US) and admin changes not reflecting because CF had nothing to purge. TotVogue had rules but still had stale issues due to `revalidateTag` bug (see RULE C12).

### Rules
1. **`clone-setup.mjs` step `cf:rules` is MANDATORY** — NOT `{ optional: true }`. If CF cache rules fail to deploy, the clone setup MUST fail and report the error. No store ships without cache rules.
2. **`check-setup-sync.mjs` MUST verify CF cache rules** on every `prebuild` / `npm run check:setup`. For each store in `env-backups/`, call CF API to verify the `http_request_cache_settings` ruleset has ≥ 3 rules. Block build if any store is missing rules.
3. **After every `stores:all` or `stores:sync-cf`**, verify CF cache rules are deployed on all stores. The `stores:verify` step MUST check `cf-cache-status: HIT` (not DYNAMIC or MISS on warm requests).
4. **Standard 4 CF cache rules** (deployed by `update-cf-cache-rules.mjs`):
   - `no-cache-dynamic`: bypass for /cart, /checkout, /account, /api, /admin, /wishlist, /order, /login, /signup
   - `static-assets`: `/_next/static/*` → 1 year edge TTL
   - `html-pages`: all other pages → **30 days edge TTL** (freshness = purge-on-write)
   - `supabase-images`: supabase.co images → 30 day edge TTL
5. **If a store's CF `cf-cache-status` shows DYNAMIC or persistent MISS**, investigate immediately — likely cache rules are missing or the zone is in "Development Mode" (disables caching).
6. **Never shorten the `html-pages` TTL to "fix" staleness.** It is 30 days on purpose: every admin write purges the edge (`revalidateStorefrontEdge` → `purge_everything`), so freshness does **not** depend on the TTL. A short TTL multiplies Vercel origin hits and burns bandwidth (the reason this rule caches HTML at all). If a store shows stale content, debug the purge path (webhook secret, `revalidateTag`, CF token) — not the TTL.
7. **ONE shared source for the rules** — `scripts/lib/cf-cache-rules.js`. Both `deploy-cloudflare-rules.js` (clone setup, single store) and `update-cf-cache-rules.mjs` (`cf:rules:all`) import `buildCacheRules()` from it (RULE SSOT1). Never paste the rule array into another script.
