-- Premium ("PRO") themes gate (additive, safe). Default off = premium theme
-- presets are locked until the store enables them in the customizer / Premium tab.
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS premium_themes_enabled BOOLEAN DEFAULT false;

-- Refresh the secret-free storefront view to include the new column.
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'store_settings'
    AND column_name NOT IN ('smtp_app_password','postex_api_token','content_keys','vision_keys','ai_model_credentials');
  EXECUTE format('CREATE OR REPLACE VIEW public.store_settings_public AS SELECT %s FROM public.store_settings', cols);
END $$;
GRANT SELECT ON public.store_settings_public TO anon, authenticated;
