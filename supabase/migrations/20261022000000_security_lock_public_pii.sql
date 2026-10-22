-- ============================================================================
-- SECURITY LOCK — public PII / secret exposure + DB-level admin escalation
-- ============================================================================
-- Audit findings this fixes (verified against the live anon key on all stores):
--
--   1. `orders` had  "Public select orders" USING (true)  → anon could read
--      every order: customer_name, customer_phone, customer_email, notes,
--      items and access_token (the /order/<token> secret).
--   2. `orders` had  "Public insert orders" WITH CHECK (true) → anon could
--      POST fake orders straight to PostgREST, bypassing the server action's
--      honeypot / phone validation / rate-limit shield.
--   3. `store_settings` GRANTed table-level SELECT to anon → smtp_app_password,
--      postex_api_token, content_keys, vision_keys and ai_model_credentials
--      were readable with the public anon key. NOTE: the earlier column-level
--      REVOKE (20260926180000) is a NO-OP while the table-level grant exists —
--      Postgres keeps the table grant. This migration revokes the TABLE grant.
--   4. `reviews` exposed customer_email + customer_phone to anon.
--   5. Every "Admin all …" policy used `auth.role() = 'authenticated'`, so any
--      self-signed-up Supabase user became a DB-level admin. Replaced with
--      public.is_admin(), which requires app_metadata.role = 'admin'.
--
-- Order creation/reading is service-role only (lib/services/orders/*), and the
-- storefront review reader now selects explicit public columns, and the recent-
-- buyer ticker moved to a server action — so no anon access is required.
--
-- REVERT (per block): re-create the dropped public policies / GRANT SELECT.
-- ============================================================================

-- ── 1. Admin allow-list + single admin predicate ──────────────────────────
-- `admin_users` is the DB-level source of truth for who may bypass RLS. It is
-- populated from NEXT_PUBLIC_ADMIN_EMAIL by scripts/apply-security-lock.mjs
-- (and by clone:setup for new stores). Never readable/writable by anon.
CREATE TABLE IF NOT EXISTS public.admin_users (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT ALL ON public.admin_users TO service_role;

-- An admin is either listed in admin_users (email claim) or explicitly tagged
-- with app_metadata.role = 'admin'. SECURITY DEFINER so the lookup itself does
-- not depend on a policy (avoids recursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.admin_users a
      WHERE lower(a.email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ── 2. orders: no anon read, no anon insert ────────────────────────────────
DROP POLICY IF EXISTS "Public select orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
REVOKE SELECT, INSERT ON public.orders FROM anon;

-- Child rows are written by the service role inside createOrder().
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
REVOKE INSERT ON public.order_items FROM anon;
DROP POLICY IF EXISTS "Public insert order_addresses" ON public.order_addresses;
REVOKE INSERT ON public.order_addresses FROM anon;

-- ── 3. reviews: public columns only (no email / phone) ─────────────────────
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (
  id, product_id, customer_name, rating, comment, approved, hidden,
  is_manual, is_verified_purchase, screenshot_url, images, store_reply,
  is_featured, sort_order, helpful_count, deleted_at, created_at
) ON public.reviews TO anon;

-- ── 4. store_settings: anon reads the secret-free VIEW only ────────────────
REVOKE SELECT ON public.store_settings FROM anon;
-- (store_settings_public is the only anon-facing read path; it is granted in
--  20260926150000_add_store_settings_public_view.sql)

-- Column-level belt-and-braces for the authenticated role too (admin reads
-- secrets exclusively through supabaseAdmin / server-secrets.ts).
REVOKE SELECT (smtp_app_password, postex_api_token, content_keys, vision_keys,
               ai_model_credentials) ON public.store_settings FROM anon, authenticated;

-- ── 5. Replace "any authenticated user" with is_admin() everywhere ─────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname <> 'Authenticated read schema_version'
      AND (
        coalesce(qual, '')       LIKE '%auth.role()%authenticated%'
        OR coalesce(with_check, '') LIKE '%auth.role()%authenticated%'
      )
  LOOP
    IF r.cmd = 'INSERT' THEN
      EXECUTE format(
        'ALTER POLICY %I ON public.%I WITH CHECK (public.is_admin())',
        r.policyname, r.tablename
      );
    ELSIF r.cmd IN ('SELECT', 'DELETE') THEN
      EXECUTE format(
        'ALTER POLICY %I ON public.%I USING (public.is_admin())',
        r.policyname, r.tablename
      );
    ELSE
      EXECUTE format(
        'ALTER POLICY %I ON public.%I USING (public.is_admin()) WITH CHECK (public.is_admin())',
        r.policyname, r.tablename
      );
    END IF;
  END LOOP;
END $$;
