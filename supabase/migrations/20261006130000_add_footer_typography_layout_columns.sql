-- Footer typography + layout columns (editable from Settings + Customizer, same keys)
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS footer_heading_font   TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_font      TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_size   TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_size      TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_weight TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_weight    TEXT,
  ADD COLUMN IF NOT EXISTS footer_align          TEXT,
  ADD COLUMN IF NOT EXISTS footer_padding        TEXT;
