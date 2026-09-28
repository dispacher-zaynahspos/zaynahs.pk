-- ============================================================================
-- CRITICAL RLS/PII hardening (additive, reversible). Admin audit Phase-0 #7.
-- ============================================================================
-- BEFORE: `customers` had `Public read USING(true)` → anon could SELECT the whole
-- table incl. password_hash, reset_token, email, phone. `abandoned_carts` had an
-- "Admin read" policy that was actually `USING(true)` → anon could read cart PII.
--
-- AFTER: anon can no longer SELECT either table. All admin reads run through the
-- service-role client (supabaseAdmin, bypasses RLS) or the Supabase-authenticated
-- admin session (auth.role()='authenticated'), so nothing in the app breaks:
--   - customers: read via supabaseAdmin (auth.ts, passwordReset.ts, create.ts,
--     order-triggers, cron) OR admin authenticated session (admin.ts, order-create).
--   - abandoned_carts: read via /api/admin (requireAdmin + service role) and admin
--     realtime subscription (authenticated session) — kept working via authenticated SELECT.
-- Storefront never reads these with the anon client. Public INSERT/UPDATE (guest
-- checkout + cart tracking) are preserved.
--
-- Reversible: to roll back, re-create the `USING(true)` SELECT policies.
-- ============================================================================

-- customers: remove anon read; keep public insert + admin-all.
DROP POLICY IF EXISTS "Public read customers" ON public.customers;
DROP POLICY IF EXISTS "Admin all customers" ON public.customers;
CREATE POLICY "Admin all customers" ON public.customers
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- (service_role bypasses RLS entirely; anon retains only the Public insert policy)
REVOKE SELECT ON public.customers FROM anon;

-- abandoned_carts: restrict SELECT to authenticated admin (was USING(true)).
DROP POLICY IF EXISTS "Admin read abandoned carts" ON public.abandoned_carts;
CREATE POLICY "Admin read abandoned carts" ON public.abandoned_carts
  FOR SELECT USING (auth.role() = 'authenticated');
REVOKE SELECT ON public.abandoned_carts FROM anon;
