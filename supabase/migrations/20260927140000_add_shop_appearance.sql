-- Shop page appearance (additive, safe). Defaults preserve current look.
--   shop_grid_gap       tight|normal|relaxed  (space between catalog cards)
--   shop_show_breadcrumbs bool
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS shop_grid_gap TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS shop_show_breadcrumbs BOOLEAN DEFAULT true;

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
