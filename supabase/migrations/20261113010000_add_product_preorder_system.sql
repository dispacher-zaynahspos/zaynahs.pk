-- Migration: Add product pre-order / pre-booking system
-- Supports:
-- 1. is_preorder (boolean): master toggle for product pre-booking
-- 2. preorder_end_date (timestamptz): countdown timer target date/time
-- 3. preorder_dispatch_date (text): expected delivery / shipping timeline e.g. "Ships on Dec 5th"
-- 4. preorder_limit (integer): optional maximum pre-order units

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preorder_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preorder_dispatch_date TEXT,
  ADD COLUMN IF NOT EXISTS preorder_limit INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_is_preorder ON products(is_preorder) WHERE is_preorder = true;
