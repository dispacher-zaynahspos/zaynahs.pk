-- ============================================================================
-- Part 2 — REVOKE secret columns from anon (⚠️ APPLY ONLY AFTER DEPLOY)
-- ============================================================================
-- Prerequisite: `20260926150000_add_store_settings_public_view.sql` applied AND
-- the app deployed with fetchSettings reading `store_settings_public` (view).
--
-- This blocks the anon/authenticated roles from ever SELECTing the secret
-- columns on the base table (closes the direct-anon-key read vector). It is
-- breaking for any old code still doing `select('*')` on `store_settings`,
-- which is why it runs ONLY after the new code is live.
--
-- Rollback: GRANT SELECT (<cols>) ON public.store_settings TO anon, authenticated;
-- ============================================================================

REVOKE SELECT (smtp_app_password, postex_api_token, content_keys, vision_keys, ai_model_credentials)
  ON public.store_settings FROM anon;
REVOKE SELECT (smtp_app_password, postex_api_token, content_keys, vision_keys, ai_model_credentials)
  ON public.store_settings FROM authenticated;
