-- Mobile sticky "View Bag" cart bar visibility toggle (customizer control).
-- Additive, non-destructive. Default true = existing behavior unchanged.
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS cart_bar_enabled BOOLEAN DEFAULT true;
