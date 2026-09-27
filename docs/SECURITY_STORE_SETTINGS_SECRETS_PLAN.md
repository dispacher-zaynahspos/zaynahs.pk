# SECURITY REMEDIATION PLAN — store_settings / customers / orders secret & PII exposure (S2)

> Status: **PLANNED — requires staging verification per store before production.**
> This is the single highest-severity finding in `docs/DEEP_AUDIT_PLAN.md` (S2, Critical).
> It is intentionally NOT shipped as an auto-run migration because a blind apply would
> break the live storefront (which currently reads `store_settings` with `select('*')`
> through the anon key). Apply the steps below on ONE store's staging DB, verify, then roll out.

## The problem
`supabase/schema/SUPER_MASTER_SCHEMA.sql` currently grants:
- `store_settings` → `CREATE POLICY "Public read store_settings" ... FOR SELECT USING (true)`
- `customers`      → `Public read customers ... USING (true)`
- `orders`         → `Public select orders ... USING (true)`

Because of this, anyone with the public anon key can read:
- `store_settings.smtp_app_password`, `postex_api_token`, `content_keys`, `vision_keys`,
  `ai_model_credentials` (all secrets)
- every `customers` row (name, phone, address = PII)
- every `orders` row (full order history + customer contact)

## Why we can't just flip the policies off
The public storefront (SSR + some client components) reads `store_settings` via
`select('*')` (`lib/services/settings/queries.ts:fetchSettings`). RLS is row-level, not
column-level, so simply removing the public policy would blank the storefront. We need a
**public-safe projection** that exposes only non-secret columns.

## Recommended fix (per store, staging first)

### Step 1 — DB: public-safe view for store_settings
```sql
-- Keep RLS on; REMOVE the blanket public read, keep authenticated/service-role full.
DROP POLICY IF EXISTS "Public read store_settings" ON store_settings;
-- (authenticated "Admin all store_settings" policy already exists → admin unaffected;
--  server reads use the service-role key which bypasses RLS.)

-- Public-safe view: EVERY non-secret column the storefront needs, explicitly listed.
-- NEVER include: smtp_app_password, postex_api_token, content_keys, vision_keys,
-- ai_model_credentials, or any other credential column.
CREATE OR REPLACE VIEW public_store_settings AS
  SELECT
    id, store_name, store_url, currency, currency_symbol, logo_url, logo_width,
    banner_url, favicon_url, tagline, address, show_stock, show_compare_price,
    enable_search, enable_category_filter, whatsapp_number, social_facebook,
    social_instagram, social_whatsapp, social_youtube, social_tiktok,
    social_snapchat, social_twitter, footer_text, meta_title, meta_description,
    theme_preset, theme_config
    -- …extend with any additional NON-SECRET columns the storefront renders.
  FROM store_settings;

GRANT SELECT ON public_store_settings TO anon, authenticated;
```

### Step 2 — Code: split secret vs public reads
- Public/storefront read path (`fetchSettings` when unauthenticated) → read from
  `public_store_settings` (never `select('*')` on the base table with the anon key).
- Admin/server read path (settings editor, email send, courier, AI) → keep using
  `supabaseAdmin` (service-role) against `store_settings` — bypasses RLS, sees secrets.
- Audit every `from('store_settings')` call site (18 today) and label each public vs admin.

### Step 3 — customers / orders
```sql
DROP POLICY IF EXISTS "Public read customers" ON customers;   -- keep "Public insert customers"
DROP POLICY IF EXISTS "Public select orders" ON orders;       -- keep "Public insert orders"
```
Then confirm no storefront path reads customers/orders with the anon key (checkout writes
use INSERT only; order-confirmation lookups should use a service-role server action keyed
by order id/token, not a public table scan).

## Verification checklist (run per store on staging)
1. Storefront home/product/shop pages render (name, logo, colors, social links all present).
2. `select smtp_app_password from store_settings` with the **anon** key → permission denied / null.
3. `select * from customers` and `select * from orders` with the **anon** key → 0 rows.
4. Admin console: settings save, order list, customer list all still work (authenticated).
5. Checkout still creates an order + customer.
6. Emails still send (service-role read of SMTP creds still works).

Only after all 6 pass on staging → apply to production for that store, then repeat for the
other 3 stores (littlemister, minimahal, totvogue, zaynahs). Credentials are in `env-backups/`.
