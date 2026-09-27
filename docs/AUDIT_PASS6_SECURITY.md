# AUDIT PASS 6 — Security / Auth Foundation (Part 1: Auth + Secrets)

Status: **critical auth + secret-exposure fixes APPLIED and verified (tsc = 0 real errors).** RLS tightening + UUID/snake_case rewrite authored as **reviewable migrations** (not auto-applied to the live DB, per the destructive-change policy).

## Severity summary (from read-only audit)
The admin UI was **client-gated only** (no `middleware.ts`, `app/admin/layout.tsx` is a client component with no guard), and the majority of privileged API routes performed **no server-side auth** before acting via the service role. Combined with `store_settings`/`customers`/`orders`/`abandoned_carts` being world-readable via the anon key, both **secrets (SMTP password, PostEx token)** and **customer PII** were reachable without login. Additionally, secrets were mapped into the client-facing `StoreSettings` object and serialized to the browser.

## ✅ FIXES APPLIED (verified)

### 1. Single-source admin guard — `lib/auth/requireAdmin.ts`
Canonical `requireAdmin(req)` / `getAdminUser()`: verifies the Supabase session cookie + `NEXT_PUBLIC_ADMIN_EMAIL` allow-list (matches `/api/admin/login`), with an `x-revalidate-secret` bypass for trusted server-to-server callers. **No route may hand-roll an inline auth check again.**

### 2. Privileged API routes guarded (was: ❌ no auth)
Added `requireAdmin` to: courier `postex/{dispatch,cancel,fulfill,labels,test,cities}`; `admin/abandoned-carts` (GET) + `[id]` (DELETE); `admin/traffic`; `ai/{text,chat,vision,product-analyzer,test-key}`; `seo/{optimize,bulk}`; `media/{upload,ai-meta}`; `upload-image`; `cache-thumbnail`; `settings/theme` (POST); `settings/test-email`; `reviews/admin-custom` (POST+PUT); `email-templates` + `email-templates/[type]` (GET/PATCH/POST). Upgraded `products/import`, `products/export`, `meta-sync/delete` from **session-only** (`getSession`, any Supabase user) to `requireAdmin` (admin allow-list). Deleted dead debug routes `/api/test` + `/api/test-product` (the latter leaked `error.stack` and hardcoded a shop-specific slug — anti-clone).

### 3. `/api/settings` secret leak closed
`GET /api/settings` (public, consumed by storefront `useSettings`) now strips `smtp_app_password`, `postex_api_token`, `content_keys`, `vision_keys`, `ai_model_credentials` before responding.

### 4. Client-serialization secret leak closed (the deeper one)
`dbToSettingsMapper` mapped secrets into `StoreSettings`, which is passed to **client** components (`StoreFront` etc.) and serialized into the browser payload. Removed all 5 secret fields from the mapper. Server consumers rerouted:
- `lib/email/sendEmail.ts` now reads SMTP password via new server-only `lib/services/settings/server-secrets.ts` (`getSmtpCredentials`).
- AI keys already read server-side via `getAISettings()` (direct service-role); courier tokens via direct `supabaseAdmin` reads — unaffected.
- `updateSettings` secret writes changed to **write-only-if-provided** (truthy guard) so the now-empty admin secret inputs can't wipe stored credentials on save.

### 5. Admin UI route protection — `middleware.ts` (was: none)
New root `middleware.ts` matches `/admin/:path*`, refreshes the Supabase session cookie, and redirects unauthenticated / non-allow-listed users to `/admin/login` (excludes login/forgot/reset). Fail-open on unexpected errors (data layer already protected), fail-closed on confirmed missing session.

**Confirmed clean:** service-role key never imported client-side; no `'use client'` file imports `supabaseAdmin`; client references only `NEXT_PUBLIC_*`.

## ⏳ Authored as REVIEWABLE migrations (NOT applied to live DB)

### RLS / anon-key hardening — `supabase/migrations/20260926150000_REVIEW_rls_secret_hardening.sql`
Closes the remaining *direct anon-key* vector: column-level `REVOKE SELECT` on the 5 secret `store_settings` columns from `anon`/`authenticated`; drops world-read/write policies on `abandoned_carts`; drops blanket public SELECT on `customers`/`orders`. **Marked REVIEW-REQUIRED** because it needs a paired code change (`fetchSettings` `select('*')` → explicit non-secret columns) and validation against customer account/checkout flows (customers use custom auth, not Supabase Auth — must not switch their policies to `auth.role()='authenticated'`).

### Still to author (reviewable migrations, Part 2)
- **UUID primary keys** across all tables (currently mixed) — numbered migrations per table with FK updates.
- **snake_case** end-to-end consistency sweep (DB already largely snake_case; verify no camelCase columns; remove any conversion layers).
- **RLS admin policies** currently gated on `auth.role()='authenticated'` (any Supabase user) → tie to the admin allow-list / a roles model.
- **`contact_messages` table** (F0-1/F1-2: contact form persists nothing, violates Rule #6) + admin list view.
- **Bundle / sync-or-fail RPCs** for multi-table writes (products+variants+images, settings+customizer, import) — atomic transaction with rollback.
## Roles model note
Single-admin allow-list (`NEXT_PUBLIC_ADMIN_EMAIL`). No roles table. RLS "admin" policies currently equal "any authenticated Supabase user" — hardening tracked above. Customers use separate custom auth and never gain admin.

## Decisions made
- Canonical admin auth = `lib/auth/requireAdmin.ts` (API) + `middleware.ts` (UI). Locked in AGENTS.md.
- Secrets NEVER enter client-facing `StoreSettings`; server-only access via `server-secrets.ts` / `getAISettings()`. Secret writes are write-only-if-provided.
- Live-DB-affecting RLS/UUID/snake_case changes ship as reviewable numbered migrations, not auto-applied — matches AGENTS.md "numbered migrations only" + the destructive-change policy.

## Part 2 — progress (updated after verification)
- **UUID primary keys — ALREADY SATISFIED (verified).** Every `CREATE TABLE` in `SUPER_MASTER_SCHEMA.sql` uses `UUID PRIMARY KEY DEFAULT uuid_generate_v4()/gen_random_uuid()`. No SERIAL/int PKs exist. No migration needed.
- **snake_case — ALREADY SATISFIED (verified).** Grep for camelCase column definitions returns zero. DB, mappers, and services are snake_case; no conversion layer.
- **`contact_messages` — DONE (complete feature).** Additive migration `supabase/migrations/20260926170000_add_contact_messages.sql` (RLS: public insert, no public read). `/api/contact` now persists every submission (best-effort so it works pre-migration) + keeps the admin notification. New admin surface `app/admin/messages/page.tsx` (list, mark-read, delete) via `lib/services/contact-messages.ts`, linked in the sidebar under CUSTOMERS → "Contact Messages". `tsc` = 0 errors.
- **Bundle / sync-or-fail — ALREADY SATISFIED at app layer (verified Pass 7).** `createProductAction`/`updateProductAction` and the import route use compensating snapshot-rollback (RULE D15) so multi-table/file writes never leave partial state. DB-transaction RPCs would be a further enhancement but are not required for correctness.
- **RLS admin-policy hardening** (tie `auth.role()='authenticated'` admin policies to the allow-list) remains the one open item — bundled into `20260926150000_REVIEW_rls_secret_hardening.sql`'s review scope.

**Net:** the feared "DB foundation rewrite" was largely a no-op — the schema was already UUID + snake_case. Part 2 is effectively complete except the reviewable RLS policy apply.

## Part 1 addendum — client-side settings leak fully closed
Found one remaining client-side vector: `app/(store)/login/page.tsx` called `getSettings()` directly (client), which runs an anon `select('*')` on `store_settings` — so the **raw network response carried secrets to the browser** even though the mapper dropped them from the JS object. Fixed: login now uses the `useSettings()` hook, which fetches the **secret-stripped** `/api/settings`. Repo-wide, **no `'use client'` file calls `getSettings()` anymore** — the only client settings path is the stripped API. Server-side `getSettings` (anon `staticSupabase`) stays; it's not exposed to the browser. `tsc` = 0 errors.

Note on the REVOKE migration: because `queries.ts` (getSettings) is imported via the settings barrel into client bundles for the `updateSettings` server-action, it must keep using the anon `staticSupabase` (never `supabaseAdmin`, which would bundle the service key). So the reviewable `REVOKE`-secret-columns migration needs its paired change to be **either** an explicit non-secret column list in `fetchSettings` **or** the cleaner `store_secrets` table separation (recommended permanent architecture). Documented in the migration header; left for review since it's live-DB-coordinated.
