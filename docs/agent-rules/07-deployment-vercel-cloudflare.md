# 07 — Deployment Rules (Vercel / Cloudflare)

- Deploy se pehle local build 100% pass hona chahiye.
- Preview deploy pe test karo, phir production.
- Verify env vars are synced with the dashboard before deploy.
- On failure, fix root-cause from logs — no blind retry.
- Every production deploy needs a ready rollback plan.

## Mandatory post-push chain (never skip, never use background timers)
```bash
git push origin main; git push zaynahspk main; git push minimahal main; git push littlemister main; git push minioutfits main; sleep 240 && node scripts/post-deploy-fix.mjs
```
`sleep 240` blocks the terminal so the purge is guaranteed to run after Vercel finishes deploying — background schedule/timer tools get silently cancelled if the user sends a message or another background task finishes.

`post-deploy-fix.mjs` automatically:
1. Reads `.env.local` (current store) + ALL `env-backups/*.env.local` files.
2. Purges Vercel ISR cache (requires `VERCEL_TOKEN` + `VERCEL_PROJECT_NAME`).
3. Purges Cloudflare cache for EVERY store zone found.
4. Triggers `/api/revalidate` webhook on the current store.
5. Verifies all pages return HTTP 200.

If any zone/token fails → fix immediately, never skip.

## RULE AUTO1 — Agent automation flow (clone/setup)
When the user provides these 7 values (project ref ID auto-extracted from URL):
1. Supabase URL (ref auto-extracted) + service role key
2. Cloudflare zone ID + API token (`cfut_...`)
3. Vercel API token (Settings → Tokens → Create)
4. GitHub personal access token (repo + contents write)
5. Domain name

The agent automatically:
- **Supabase API**: executes `SUPER_MASTER_SCHEMA.sql` (tables, policies, bucket), creates storage bucket, creates 5 webhooks (products, categories, homepage_sections, store_settings, reviews).
- **Cloudflare API**: creates 4 Cache Rules (`no-cache-dynamic`, `static-assets`, `html-pages`, `supabase-images`), 3 Page Rules (cart/checkout/my-account → bypass), DNS records (A, CNAME, TXT — all proxied/orange-cloud).
- **GitHub + Vercel API**: `git init` + commit + push (via `GITHUB_TOKEN`); `npm i -g vercel` → `vercel --prod --token=$VERCEL_TOKEN`; sets Vercel env vars via API (from `.env.local`); `vercel domains add [domain]`; auto SSL enable.
- **Verify**: cache headers (HIT/MISS/BYPASS), webhook (`revalidated:true`), CF purge API, page rules active.

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
