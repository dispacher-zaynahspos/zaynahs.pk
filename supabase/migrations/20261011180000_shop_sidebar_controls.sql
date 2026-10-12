-- Migration: Shop sidebar (filters) controls
-- Adds Customizer-configurable options for the /shop + category page filter sidebar.
-- Defaults preserve the current behavior (left sidebar, sticky, all blocks shown).

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS shop_sidebar_position TEXT DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS shop_sidebar_sticky BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_sidebar_default_collapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_filter_show_categories BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_filter_show_availability BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_filter_show_price BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_filter_show_variations BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_filter_show_featured BOOLEAN DEFAULT true;
