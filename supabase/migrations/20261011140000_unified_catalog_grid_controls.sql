-- Migration: Unified catalog & grid layout controls (RULE DS24 / RULE SSOT-CATALOG-LAYOUTS)
-- Adds Auto/Manual columns mode, large-desktop column count, min card width,
-- content width (Boxed/Wide/Full), and Fill-rows to the three StoreSettings
-- catalog families: shop (/shop + category + search), related, recently viewed.
--
-- Content width defaults to 'wide' so big screens use the available width well
-- (sections no longer sit in a narrow box with large empty sides). Fill-rows
-- defaults ON so a batch rounds up to full rows when more products exist.
-- Home section grids store their columns in homepage_sections.settings JSONB and
-- need NO schema change.

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS shop_columns_mode TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS shop_columns_wide INTEGER,
  ADD COLUMN IF NOT EXISTS shop_min_card_desktop INTEGER,
  ADD COLUMN IF NOT EXISTS shop_content_width TEXT DEFAULT 'wide',
  ADD COLUMN IF NOT EXISTS shop_fill_rows BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS related_columns_mode TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS related_columns_wide INTEGER,
  ADD COLUMN IF NOT EXISTS related_min_card_desktop INTEGER,
  ADD COLUMN IF NOT EXISTS related_content_width TEXT DEFAULT 'wide',
  ADD COLUMN IF NOT EXISTS related_fill_rows BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_mode TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_wide INTEGER,
  ADD COLUMN IF NOT EXISTS recently_viewed_min_card_desktop INTEGER,
  ADD COLUMN IF NOT EXISTS recently_viewed_content_width TEXT DEFAULT 'wide',
  ADD COLUMN IF NOT EXISTS recently_viewed_fill_rows BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_content_width TEXT DEFAULT 'wide';

-- One-time: lift the just-created default from 'boxed' to 'wide' for rows that were
-- added at the previous default and have not been customized yet. Safe pre-launch.
UPDATE store_settings SET shop_content_width = 'wide' WHERE shop_content_width = 'boxed';
UPDATE store_settings SET related_content_width = 'wide' WHERE related_content_width = 'boxed';
UPDATE store_settings SET recently_viewed_content_width = 'wide' WHERE recently_viewed_content_width = 'boxed';
