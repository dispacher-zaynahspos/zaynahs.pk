-- Product Details: reversible per-block visibility (additive, safe).
-- Blocks listed here stay in `product_page_layout` (order preserved) but are not
-- rendered — the customizer eye toggle adds/removes here instead of destructively
-- removing from the layout array. Default empty = all blocks visible (current look).
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS product_page_hidden_blocks TEXT[] DEFAULT '{}';

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
