-- ============================================================
-- Migration: Add Sub-Categories Support (parent_id)
-- Date: 2026-08-04
-- Fully additive — zero regression for existing categories
-- (rows with parent_id = NULL are top-level, same as before)
-- ============================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
