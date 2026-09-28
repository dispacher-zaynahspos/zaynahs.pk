-- Product card appearance controls (additive, safe). All defaults preserve the
-- current look, so a fresh clone / existing store renders identically.
--   card_shadow           none|sm|md|lg   (standard card elevation)
--   card_hover_lift       bool            (translate-y lift on hover)
--   card_border_enabled   bool            (show card border)
--   card_image_fit        contain|cover   (product image fit)
--   card_compare_color    hex             (strikethrough compare-at price, red default)
--   card_sale_price_color hex             ('' = inherit theme price token)
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS card_shadow TEXT DEFAULT 'sm',
  ADD COLUMN IF NOT EXISTS card_hover_lift BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_border_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_image_fit TEXT DEFAULT 'contain',
  ADD COLUMN IF NOT EXISTS card_compare_color TEXT DEFAULT '#ef4444',
  ADD COLUMN IF NOT EXISTS card_sale_price_color TEXT DEFAULT '';

-- Refresh the secret-free storefront view to include the new columns.
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
