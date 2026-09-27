-- ============================================================================
-- store_settings_public — secret-free view (ADDITIVE, safe to apply anytime)
-- ============================================================================
-- Part 1 of the secret-hardening (deploy-order-safe). This ONLY creates a view
-- that exposes every store_settings column EXCEPT the 5 secrets, and grants the
-- anon/authenticated roles SELECT on it. It changes nothing on the base table,
-- so it cannot break currently-deployed code.
--
-- After this is applied AND the new code (fetchSettings → store_settings_public)
-- is deployed, run the Part-2 migration
-- `20260926180000_REVIEW_revoke_secret_columns_POST_DEPLOY.sql` to REVOKE the
-- secret columns from anon on the base table (that part IS breaking for old code
-- that still does `select('*')`, hence it runs only after deploy).
--
-- The view is generated from information_schema so it includes ALL current
-- non-secret columns. NOTE: when a future migration ADDS a store_settings
-- column, re-run this `CREATE OR REPLACE VIEW` block so the new column is exposed.
-- ============================================================================

DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'store_settings'
    AND column_name NOT IN (
      'smtp_app_password', 'postex_api_token', 'content_keys', 'vision_keys', 'ai_model_credentials'
    );

  EXECUTE format(
    'CREATE OR REPLACE VIEW public.store_settings_public AS SELECT %s FROM public.store_settings',
    cols
  );
END $$;

GRANT SELECT ON public.store_settings_public TO anon, authenticated;
