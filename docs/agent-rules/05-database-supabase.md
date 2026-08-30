# 05 — Database Rules (Supabase)

## General
- Schema change se pehle migration file + RLS policy check/update.
- Naming: `snake_case`, follow existing pattern.
- Kabhi bhi production pe destructive query (`DROP`/`DELETE without WHERE`) auto-run nahi.
- Realtime-sensitive tables (POS inventory/orders) → race-safe RPC use karo.
- Major schema change se pehle backup/rollback plan banao.
- Always use `supabaseAdmin` (service role key) for admin/storefront queries — bypasses RLS, avoids nested-join RLS failures. Import: `@/lib/supabase/admin`.
- Avoid nested joins that fail on RLS: batch-fetch related data (products → collect IDs → batch fetch → merge in memory) instead of joining in the main query.

## Core Tables (Source of Truth)
```
products          → core product data
product_variants  → color/size/material combinations with price+stock
product_images    → multiple images per product
categories        → product categories
store_settings    → WhatsApp number, store name, logo, currency
orders            → WhatsApp orders tracking (optional)
reviews           → getGlobalReviews() → {reviews:[], total:0} on error (graceful degradation);
                     getTopReviews(3) for homepage, getGlobalReviews() for /reviews page
```

## Cache tags for revalidation (use with `unstable_cache`)
`products` · `categories` · `reviews` · `social_proof` · `settings`

## RULE D1 — Variant stock is mandatory
Every product with variants MUST track stock per variant in `product_variants.stock`.
`products.stock` = sum of all variant stocks (or direct stock if no variants).

## RULE D2 — Image storage
All images → Supabase Storage bucket `product-images`. Public URL stored in `product_images.url`. Never store base64 in DB. (Full storage rules: [11-storage-images.md](11-storage-images.md).)

## RULE D3 — Settings singleton
`store_settings` always has exactly ONE row. ID: `00000000-0000-4000-8000-000000000001`. Never create a second row.

## RULE D4 — Soft delete
Never hard-delete products. Use `products.active = false`. Admin can restore. Customer catalog never shows `active = false` products.

## RULE D5 — Schema change log
Every DB change MUST be logged in `docs/SCHEMA_CHANGE_LOG.md` with date, files changed, what changed.

## RULE D6 — Fully self-contained master schema & setup guide (STRICT)
Whenever any feature is added/changed/removed:
1. `supabase/schema/SUPER_MASTER_SCHEMA.sql` — MUST be updated immediately alongside the code.
2. `docs/NEW_PROJECT_SETUP_GUIDE.md` — MUST also stay current.
The repo must always remain 100% ready to clone and deploy — pasting the schema into Supabase SQL Editor must instantly set up the whole DB with zero manual configuration. The schema must handle automatically:
- All tables, constraints, foreign keys, indexes.
- RLS enabled on all tables + all client/admin policies.
- Supabase Storage bucket (`product-images`) + public read/write policies.
- Supabase Realtime publications (`supabase_realtime`) for required tables (`orders`, `abandoned_carts`, etc.)
- All trigger functions, sequences, triggers (rating synchronizer, order auto-increment, abandoned-cart order linking, etc.)
Never ask the user to manually configure tables/policies/buckets/realtime in the dashboard.

**Verify after every migration**: `node scripts/check-master-schema.mjs` — MUST pass with 0 issues. If a migration exists that isn't reflected in the master schema, fix the master schema immediately before proceeding.

## RULE D6b — Schema & code must be 100% universal (STRICT)
`SUPER_MASTER_SCHEMA.sql` is shared across ALL store clones (TotVogue, Zaynahs, MiniMahal, LittleMister, future clones).
- NEVER hardcode in `.ts`/`.tsx`/`.sql`/`.mjs`/`.js`: brand names, domains, store-specific URLs/phone/WhatsApp numbers/addresses.
- Seed data uses generic placeholders: `'Your Store Name'`, `'https://domain.com'`, `'Your Store'`.
- Dynamic values come from `store_settings` → `settings.storeName`, `settings.storeUrl`, `settings.whatsappNumber`.
- URL-replacement logic in triggers/functions matches only generic template patterns (`https://domain.com`, `http://localhost`) — never a specific live domain.
- Verify before any commit:
  ```bash
  rg "totvogue|zaynahs\.pk|minimahal|littlemister" --glob '*.ts' --glob '*.tsx' --glob '*.sql' --glob '*.mjs'
  # must return 0 matches in source files
  ```

## RULE D7 — Supabase API-only operations (STRICT)
Every Supabase operation — schema migration, SQL query, auth config, user management, storage buckets, RLS policies, webhooks, edge functions, secrets, network rules, SSL, custom domains, branches, data CRUD — goes ONLY through the Management API or Service API.
- ❌ BANNED: Prisma, Prisma Migrate, direct Postgres connection strings, `psql`, Supabase CLI `link`, Supabase CLI `db push`, any SQL client using a DB password.
- ✅ ALLOWED: `curl` with an `sbp_` token (Management API) or `service_role` key (Service API). Full reference: `docs/SUPABASE_API_GUIDE.md`.
- Before implementing any DB change, check `docs/SUPABASE_API_GUIDE.md` first — every operation has a curl example there; update the guide if one is missing.
- Migrations: create files in `supabase/migrations/`, apply via `POST /v1/projects/{ref}/database/migrations` (Management API). Never `supabase db push` or `psql`.
- RLS & Storage policies: via Management API `database/query` endpoint (SQL). Never via Dashboard or psql.
- Auth users: `POST /auth/v1/admin/users` (Service API). Never Dashboard or direct SQL.
- Storage buckets: `POST /storage/v1/bucket` (Service API). Never Dashboard.
- Full API-usage examples (token verify, cache purge, trigger creation, env var updates): [21-cloudflare-supabase-api-usage.md](21-cloudflare-supabase-api-usage.md).

## RULE D8 — Universal revalidate secret (STRICT)
`REVALIDATE_SECRET` MUST always be exactly:
```
zaynahs_secret_cache_revalidate_2026
```
across ALL clones/instances. Never generate/use a random secret for this value.
Must be hardcoded in `.env.local`, Vercel env vars, `NEW_PROJECT_SETUP_GUIDE.md`, and Supabase triggers. Testing/manual curl in `STORE_TESTING_GUIDE.md` must strictly use this secret.
**Vercel API sync**: agent MUST always keep this secret synced across all connected Vercel projects via `PATCH /v9/projects/{id}/env/{env_id}`. Never leave a mismatched secret on Vercel.

## RULE D9 — Multi-project Cloudflare webhook verification (STRICT)
Each cloned project relies on a Cloudflare API Token for the `/api/revalidate` cache-purge webhook.
- Token must be a valid **Cloudflare API Token** (`cfut_...`) with Cache Purge permission — NEVER a Global API Key (`cfk_...` or 37-char hex).
- Run `node scripts/test-cf-tokens.mjs` whenever configuring env files or when the user reports webhook/cache issues. It scans `.env.local` + `env-backups/*.env.local`, extracts every `CLOUDFLARE_API_TOKEN`, and verifies against `https://api.cloudflare.com/client/v4/user/tokens/verify`.
- If a token is INVALID/EXPIRED → immediately tell the user which project's token failed and instruct them to generate a new **API Token** (not a Global API Key).

## RULE D10 — (reserved — not present in source; skip)

## RULE D11 — No duplicate foreign key constraints (STRICT)
- Never create duplicate FK constraints on the same table pair (e.g. `fk_products_size_guide` vs `products_size_guide_id_fkey`).
- Duplicates cause `PGRST201: Could not embed because more than one relationship was found`, breaking API responses and hiding all products (`0 products found`).
- Always check existing FK names before creating a constraint; drop legacy ones with `ALTER TABLE <table> DROP CONSTRAINT IF EXISTS <legacy_name>;`.
- Storefront service queries (`staticSupabase` in `lib/services/products.ts`, `categories.ts`, `sections.ts`, etc.) MUST use `SUPABASE_SERVICE_ROLE_KEY` with fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY` to avoid RLS/schema-caching bugs.

## RULE D12 — Instant price/sale update system (MANDATORY — see also [00-prime-directives.md](00-prime-directives.md) and [08-caching-isr-ssr.md](08-caching-isr-ssr.md) RULE C5)
Flash Sale discounts apply directly to `product.price`, preserving `comparePrice`. `/api/products/list` uses `no-store, no-cache, must-revalidate`. Every deploy must run `node scripts/post-deploy-fix.mjs` via the synchronous bash chain from [00-prime-directives.md](00-prime-directives.md).

## Types synchronization (STRICT)
`lib/types.ts` is the absolute source of truth for frontend TypeScript interfaces — just as `SUPER_MASTER_SCHEMA.sql` is for the DB. Whenever a feature is added, a DB column changes, or a frontend data model updates, `lib/types.ts` MUST be updated immediately. No feature merges with `any` types. If a feature/column is removed, its type definitions must also be removed (no stale code).
