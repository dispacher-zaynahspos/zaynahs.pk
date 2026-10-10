-- ============================================================================
-- Shop pagination + bottom-grid-action settings (persist in store_settings)
-- ============================================================================
-- /shop + category pages get the same controls the Home product grid already
-- has: pagination mode (infinite / load_more / numbered), Load More button
-- (label + colors), and an optional View All button. These were type-only in
-- the app and never persisted — this migration makes them real columns so the
-- customizer save round-trips correctly and every clone gets them day-1.
-- Additive + idempotent.
-- ============================================================================

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS shop_pagination_mode   TEXT    DEFAULT 'load_more',  -- 'infinite' | 'load_more' | 'numbered'
  ADD COLUMN IF NOT EXISTS shop_enable_load_more   BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_load_more_text     TEXT    DEFAULT 'Load More',
  ADD COLUMN IF NOT EXISTS shop_load_more_bg       TEXT,
  ADD COLUMN IF NOT EXISTS shop_load_more_text_color TEXT,
  ADD COLUMN IF NOT EXISTS shop_enable_view_all    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_view_all_text      TEXT    DEFAULT 'View All',
  ADD COLUMN IF NOT EXISTS shop_view_all_url       TEXT,
  ADD COLUMN IF NOT EXISTS shop_view_all_bg        TEXT,
  ADD COLUMN IF NOT EXISTS shop_view_all_text_color TEXT;

-- Backfill mode from the legacy boolean so existing stores keep their behavior.
UPDATE public.store_settings
SET shop_pagination_mode = CASE WHEN shop_infinite_scroll THEN 'infinite' ELSE 'load_more' END
WHERE shop_pagination_mode IS NULL;

-- Recreate the secret-free storefront view so the new columns are readable by anon.
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

