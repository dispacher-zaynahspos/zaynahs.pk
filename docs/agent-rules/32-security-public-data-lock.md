# 32 — Security: Public Data Lock (PII / secrets / admin escalation)

> **Status:** ENFORCED — added after the 2026-10-22 deep audit.
> **Automation:** `npm run security:lock` (`scripts/apply-security-lock.mjs`)
> **Migration:** `supabase/migrations/20261022000000_security_lock_public_pii.sql`
> **Example store in this document:** `zaynahs.pk` (never use another brand as the example)

This file is the single source of truth for how storefront data is exposed. It exists because
the live audit found that anyone holding the **public anon key** (it ships in every browser
bundle — that is by design) could read every order, every customer phone number, and the
`ai_model_credentials` / `smtp_app_password` columns straight from PostgREST.

**The anon key is PUBLIC. Treat it exactly like a public URL. RLS is the only wall.**

---

## SEC1 — RLS on every table, grants at the minimum (STRICT)

Every `public` table MUST have:

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.<table> FROM anon, authenticated;
-- then grant ONLY what the specific role needs
```

`service_role` (server-only `supabaseAdmin`) bypasses RLS and is the default for all writes.
A missing policy is **deny** — that is the correct default. Never create a policy to "make it work"
without first asking: *which role, which rows, which columns?*

---

## SEC2 — PII tables are NEVER publicly readable (STRICT)

These tables hold customer data and MUST NOT have any `anon` SELECT policy or grant:

`orders`, `order_items`, `order_addresses`, `customers`, `abandoned_carts`,
`contact_messages`, `page_views`, `email_subscribers`, `whatsapp_subscribers`.

Public needs are served in exactly one of these three ways:

1. **Server component / server action** using `supabaseAdmin` (e.g. `getCustomerOrders()`,
   `getRecentBuyersPublic()`), scoped by the authenticated customer session.
2. **SECURITY DEFINER RPC** that returns only safe/masked fields.
3. **View** granted to `anon`, exposing only non-PII columns (e.g. `store_settings_public`).

❌ Never: `public select on orders using (true)` — this is what leaked `customer_phone`,
`customer_email` and the `access_token` that unlocks `/order/<token>`.

**Recent-buyers ticker example (zaynahs.pk):** the storefront used to read the whole
`orders` table with the anon client just to show "Ayesha from Lahore bought X". It now calls
`getRecentBuyersPublic()` (server action) which returns only `buyer_name` (masked: "Ayesha K."),
`city`, `product_id`, `created_at`. Same UI, zero PII exposure.

---

## SEC3 — `public.is_admin()` is the ONLY admin predicate (STRICT)

❌ BANNED in any policy: `auth.role() = 'authenticated'`.
Any visitor can self-signup and become `authenticated` → instant DB-level admin.

✅ REQUIRED:

```sql
public.is_admin()   -- TRUE only if app_metadata.role = 'admin'
                    -- OR the JWT email exists in public.admin_users
```

- `admin_users` is the DB allow-list, seeded from `NEXT_PUBLIC_ADMIN_EMAIL`
  by `npm run security:lock`.
- New admin = insert into `admin_users` **and** set `app_metadata.role = 'admin'`
  (belt & braces; the email check keeps existing sessions working with no lockout).
- `disable_signup` MUST stay `true` on every Supabase project.

---

## SEC4 — No `select('*')` with the anon client (STRICT)

RLS cannot hide a column. Grants do. When a table is publicly readable, list the public
columns explicitly:

```ts
// ✅ public reviews (zaynahs.pk) — email/phone are NOT granted to anon
const PUBLIC_REVIEW_COLUMNS =
  'id, product_id, customer_name, rating, comment, approved, hidden, is_manual, ' +
  'is_verified_purchase, screenshot_url, images, store_reply, is_featured, ' +
  'sort_order, helpful_count, created_at, deleted_at';

await staticSupabase.from('reviews').select(PUBLIC_REVIEW_COLUMNS);
```

❌ `staticSupabase.from('reviews').select('*')` — breaks the moment PII columns are revoked,
and silently leaks them before that.

---

## SEC5 — Secrets never leave the server (STRICT)

- `store_settings` secret columns: `smtp_app_password`, `postex_api_token`,
  `content_keys`, `vision_keys`, `ai_model_credentials`.
- Storefront/admin **client** code reads `store_settings_public` (view) only.
- Server code reads secrets through `lib/services/settings/server-secrets.ts` or `supabaseAdmin`.
- Saving goes through `updateSettings` → `encryptSecret` (`enc:v1:` envelope).
- If a secret was ever exposed (audit, log, public grant) → **rotate it**, revoking is not enough.

---

## SEC6 — Column revoke gotcha (this is why the earlier "fix" did nothing)

In Postgres, a **table-level** `GRANT SELECT` covers every column. A later
`REVOKE SELECT (secret_col)` is a **no-op** while the table grant exists.

Correct order:

```sql
REVOKE SELECT ON public.store_settings FROM anon;   -- 1. drop the table grant
GRANT SELECT (safe_col_1, safe_col_2) ON public.store_settings TO anon;  -- 2. re-grant safe columns only
```

For `store_settings` the correct answer is even simpler: **no anon grant at all** — the
`store_settings_public` view is the only public read path (views run with owner rights).

---

## SEC7 — New table / new feature checklist (MANDATORY)

Before merging any migration that adds a table or a public read:

1. `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL FROM anon, authenticated`.
2. Add only the policies the feature needs. Admin = `public.is_admin()`.
3. If the storefront needs data → server component/action (`supabaseAdmin`) or a masked view/RPC.
4. If a view is granted to `anon` → it must contain **zero** PII and **zero** secrets.
5. Add the table to `SUPER_MASTER_SCHEMA.sql` (RULE SYNC1) and run `npm run check:setup`.
6. Run `npm run security:verify` — every probe must say `CLOSED`.

---

## SEC8 — Verification (Definition of Done)

```bash
npm run security:verify          # plan only, all stores
npm run security:lock            # apply (idempotent) to all env-backups stores
```

Expected output per store (zaynahs.pk example):

```
orders                 401 CLOSED
storeSettingsSecrets   401 CLOSED
reviewsPii             401 CLOSED
reviewsPublic          200 OK      <- public reviews must keep working
store_settings_public  200 OK      <- storefront settings must keep working
```

Manual spot-check (must be 401/403, never a JSON row):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/orders?select=id" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

---

## SEC9 — Credentials hygiene (STRICT)

- `env-backups/*.env.local` is the canonical store registry — **never** commit it, never paste it.
- Never embed tokens in git remote URLs (`https://user:ghp_xxx@github.com/...`). Use SSH or the
  OS credential helper. Rotate any token that ever sat in `.git/config`.
- A leaked third-party key (Gemini, SMTP, PostEx, Meta) is rotated in the provider console by the
  owner — an agent can close the exposure but cannot mint a replacement key.

---

## Cross-references

- [05-database-supabase.md](05-database-supabase.md) — RULE D13/D14/D15, schema sync (RULE SYNC1/2)
- [22-credentials-management.md](22-credentials-management.md) — env-backups, token handling
- [27-single-source-of-truth.md](27-single-source-of-truth.md) — `server-secrets.ts`, `is_admin()` SSOT
- [13-autonomy-boundaries.md](13-autonomy-boundaries.md) — live-DB changes need review + smoke test
- `docs/SECURITY_STORE_SETTINGS_SECRETS_PLAN.md` — original secret-hardening plan (Part 1/2)
