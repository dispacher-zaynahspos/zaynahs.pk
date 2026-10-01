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

## RULE D13 — `snake_case` ONLY, camelCase 100% BANNED (STRICT — zero tolerance)
> **camelCase kabhi allowed nahi.** Har naya/purana identifier jo DB row / API payload / frontend row-state / sync / JSONB key represent karta hai — sirf `snake_case`. Koi camelCase↔snake conversion/mapping layer, koi camelCase alias, koi "temporary" camel field — **banned**. Naya code jo camelCase DB-shaped key introduce kare = PR reject. Migration ke waqt JSONB blobs (orders.items, status_logs, theme_config, variant_presets.values) ke andar ke keys bhi snake_case me convert honge (data-migration ke saath), camel legacy sirf ek one-time read-normalizer se accept hoga jab tak backfill complete na ho — uske baad normalizer bhi hatega.

Ek hi naming convention — **`snake_case`** — poore data flow me: DB columns → RPC params → API request/response payloads → frontend state jo directly DB rows represent karta hai → sync/queue payloads. Beech me **koi camelCase↔snake_case conversion/mapping layer allowed nahi** (data integrity + leakage risk).
- DB me sab columns `snake_case` (already enforced — line 5).
- API routes DB rows ko as-is (`snake_case`) return/accept karein — response me rename mat karo.
- Frontend jo row-shaped data hold karta hai wo bhi `snake_case` keys rakhe (`product.is_active`, `variant.stock`, `order.created_at`).
- Naya code camelCase alias introduce na kare. `lib/types.ts` interfaces DB columns se 1:1 `snake_case` match karein.
- **Current status (cutover done 2026-09-26):** `Product`, `ProductImage`, `ProductVariant`, `ProductModifier`, `Badge`, `SizeGuide`, `Category`, `Collection`, `ProductCategoryRelation`, `Order` (columns), `ShippingMethod`, `PaymentMethod`, `Coupon`, `Review`, `SocialProof`, `EmailTemplate`, `VariantPreset`, `CartItem`, `StatusLogItem`, `StoreSettings` (+ all 128 camel fields), `ThemeConfig` (top-level) — **sab `snake_case`**. Mappers ab near-identity (no camel conversion).
- **Baaki sirf self-contained JSONB design-token/section-config blobs** (nested `theme_config.colors.textPrimary` design tokens + `homepage_sections.settings` customizer-section keys) camelCase hain — ye DB column-naming nahi, self-contained data payloads hain jinke writer+reader dono consistent hain. Inhe convert karne se koi schema-consistency benefit nahi + high theme-break risk, isliye documented exception.
- **Deliberate exceptions (DO NOT "fix" without a DB data migration):**
  - **`CartItem` / `StatusLogItem`** camelCase RAHENGE — ye `orders.items` / `orders.status_logs` **JSONB** columns ke andar store hote hain; existing orders me keys camelCase hain. Inhe snake karne se purane orders ka data toot jaayega jab tak ek JSONB data-migration na ho.
  - **`StoreSettings`** + uske JSONB blobs (`theme_config` keys jaise `textPrimary`, `ai_persona_config`) camelCase hain — inka apna mapper hai; JSONB keys DB me camelCase stored hain.
  - Meta-sync API (`/api/meta-sync/bulk`) aur product export/import bundle apna camelCase wire-shape rakhte hain (self-contained, consumer bhi wahi shape padhta hai).
- **Rename karna ho to fool-proof tarika:** `scripts/snake-case-codemod.mjs` (ts-morph, symbol-based rename — same-naam fields doosre types par nahi chhuta). Manual global find-replace mat karo.
- **Verify before commit:**
  ```bash
  npx tsc --noEmit    # green = types consistent
  rg "\b[a-z]+[A-Z][a-zA-Z]*\s*:" --glob 'lib/types/product.ts' --glob 'lib/types/category.ts'   # camelCase key = red flag
  ```

## RULE D14 — UUID primary keys on every table (STRICT)
Har domain table (products, product_variants, product_images, categories, orders, customers, store_settings, AI/settings config, media, etc.) ka primary key **UUID** ho — serial/int/`bigint identity` ya mixed scheme banned.
- Default: `id uuid primary key default gen_random_uuid()`.
- Human-facing sequence (jaise order number) alag column ho (`order_number bigint`), PK nahi.
- Deviate karti koi table mile → proper **numbered migration** se fix karo (`supabase/migrations/`), Dashboard manual edit se kabhi nahi (RULE D7), + `SUPER_MASTER_SCHEMA.sql` update (RULE D6).

## RULE D15 — Atomic writes: fully succeed or fully fail (STRICT)
Koi bhi user action jo **2+ tables** likhta hai, ya **write + file upload** karta hai (e.g. product + variants + images ek saath), wo **ek atomic operation** ke roop me commit ho. Koi part fail → **kuch bhi save nahi** (no half-created product, no variants-saved-but-images-failed, no partial sync state).
- Preferred: ek **Postgres function (RPC)** jo saara multi-table write ek transaction me kare; API route sirf us RPC ko call kare.
- Alternative (jahan file upload involved ho): API route staged writes kare + kisi bhi step fail par explicit **rollback/compensation** (uploaded file delete, inserted rows delete).
- Sequential unguarded writes (loop me 6 alag `update`) banned — ya bundled RPC, ya transaction.
- Har touched write-path OP3 + RULE V1 proof-of-fix se guzre.

### Why (real POS-style failure this prevents)
Ek sale/checkout ya multi-step action me kai cheezein ek saath honi hain: order/sale record, inventory minus, payment record, (POS me) bill print + device sync. Agar bundle atomic na ho aur beech me koi step fail ho jaye — e.g. **bill print nahi hua / sync fail ho gaya** — to aisa NAHI hona chahiye ke **sale record ho gaya + inventory minus ho gayi + paisa receive nahi hua** (ya ulta). Ya to **poora bundle commit** ho, ya **poora rollback** — koi partial state (orphan stock decrement, half-synced record, ghost order) kabhi na bane. Yehi D15 ka maqsad hai: "sync ho to poora, warna kuch nahi."

## RULE D16 — Every new file / domain / module / tab must be born compliant (STRICT)
Jab bhi aage koi **nayi table, column, domain, module, ya admin tab** add ho, wo pehle din se in rules pe ho — baad me "fix" karne ka concept nahi:
- **UUID primary key** (`gen_random_uuid()`), **snake_case** har column/table (no camelCase, no conversion layer), aur **RLS enabled + explicit policy** (public read sirf jahan storefront ko chahiye; secrets/PII service-role only).
- Multi-table/file writes D15 bundle (sync-or-fail) se guzrein.
- Client-facing code kabhi secret column map/return na kare (server-only via `server-secrets.ts` / `getAISettings`; storefront `store_settings_public` view se padhe).
- `SUPER_MASTER_SCHEMA.sql` + `lib/types.ts` usi task me update hon (agar object exist nahi karta to master schema me add ho — complete/based).
- Result: no error, no leakage, no patches — har naya module clone-ready + audit-clean by construction.

## Types synchronization (STRICT)
`lib/types.ts` is the absolute source of truth for frontend TypeScript interfaces — just as `SUPER_MASTER_SCHEMA.sql` is for the DB. Whenever a feature is added, a DB column changes, or a frontend data model updates, `lib/types.ts` MUST be updated immediately. No feature merges with `any` types. If a feature/column is removed, its type definitions must also be removed (no stale code).

## RULE D17 — Clean, URL-safe product slugs (STRICT — two-layer guarantee)
Product slug kabhi bhi spaces, UPPERCASE, pipes `|`, ya kisi non-URL-safe char ke saath store NA ho (ye ugly/broken product URLs `%20`, capitals banata hai aur 404/500 confusion deta hai).
- **SSOT slugify:** sirf `lib/utils/slugify.ts` canonical slug banata hai (lowercase, `&`→`and`, non-alnum→`-`, trim `-`). Koi inline alternate slug logic likhna banned — hamesha `slugify()` import karo.
- **Layer 1 — app write boundary:** har product write path (`lib/services/products/actions.ts`, `mutations.ts`, `updateProductFields.ts`) slug ko store karne se pehle `slugify()` se guzaare; empty hone par `name` se derive kare.
- **Layer 2 — DB trigger (final safety net):** `products` table pe `BEFORE INSERT OR UPDATE OF slug, name` trigger `products_normalize_slug_trigger()` + `normalize_slug(text)` function slug ko normalize karta hai — chahe writer app ho, CSV import, AI rename, script, ya direct SQL. Ye `SUPER_MASTER_SCHEMA.sql` me hai (har clone ko milta hai) + migration `20260929120000_product_slug_normalization.sql` (existing dirty slugs ek-baar clean karta hai, idempotent).
- **Duplicate uniqueness:** duplicate product ka slug `slugify(base) + '-copy-' + Date.now()` (app/admin/products/new/page.tsx) — clean + unique.
- Same approach categories/collections slugs ke liye bhi apply karo agar wahan dirty-slug risk mile.

