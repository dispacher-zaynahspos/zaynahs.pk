-- Cart Recommendations & Free Shipping Settings
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cart_recommendations_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cart_recommendations_source TEXT DEFAULT 'recently_viewed';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cart_recommendations_title TEXT DEFAULT 'You May Also Like';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cart_recommendations_limit INTEGER DEFAULT 4;

-- Recreate store_settings_public view so anon/storefront can read the new columns
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position) INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'store_settings'
    AND column_name NOT IN ('smtp_app_password','postex_api_token','content_keys','vision_keys','ai_model_credentials');
  EXECUTE format('CREATE OR REPLACE VIEW public.store_settings_public AS SELECT %s FROM public.store_settings', cols);
END $$;
GRANT SELECT ON public.store_settings_public TO anon, authenticated, service_role;
