-- Migration: 20261009180000_responsive_swatches_controls.sql
-- Add responsive swatch controls (Desktop, Tablet, Mobile) and PDP swatch alignment & shape

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS archive_swatch_size_desktop TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_swatch_size_tablet TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_swatch_size_mobile TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS swatch_limit_desktop INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS swatch_limit_tablet INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS swatch_limit_mobile INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_swatch_align_desktop TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_swatch_align_tablet TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_swatch_align_mobile TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_size_desktop TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_size_tablet TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_size_mobile TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_align TEXT DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS product_swatch_align_desktop TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_align_tablet TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_align_mobile TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_swatch_shape TEXT DEFAULT 'circle';
