-- Mobile Bottom Nav item builder (Phase 4 Global) — per-item visibility/label/order + show-labels toggle.
-- ADDITIVE, safe. NULL items = component uses built-in default 5 items (no visual change).
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS mobile_bottom_nav_show_labels BOOLEAN DEFAULT true;
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS mobile_bottom_nav_items JSONB DEFAULT NULL;
