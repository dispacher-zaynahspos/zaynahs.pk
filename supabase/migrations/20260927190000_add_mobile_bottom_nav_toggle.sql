-- Mobile Bottom Nav enable toggle (Phase 4 Global — closes "Mobile Bottom Nav has 0 controls" gap).
-- ADDITIVE, safe, non-destructive. Default true = no visual change for existing stores.
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS mobile_bottom_nav_enabled BOOLEAN DEFAULT true;
