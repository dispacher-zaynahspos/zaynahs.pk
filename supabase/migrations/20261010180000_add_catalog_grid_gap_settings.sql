-- Migration: Add related_grid_gap and recently_viewed_grid_gap to store_settings
-- Enables unified catalog & grid layout gap controls across all storefront product sections

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS related_grid_gap TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS recently_viewed_grid_gap TEXT DEFAULT 'normal';
