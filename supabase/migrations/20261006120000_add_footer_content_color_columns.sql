-- Footer color columns
-- Root cause fix: Footer.tsx + Customizer GlobalSettings read & write footer color keys,
-- but these columns were never present in the live DB, so footer color edits silently
-- failed to persist ("footer colors don't apply" bug). Column-title fields already exist
-- as footer_col_N_title (underscore) and are mapped correctly, so only colors are added.
-- Additive + idempotent.

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS footer_bg               TEXT,
  ADD COLUMN IF NOT EXISTS footer_text_color       TEXT,
  ADD COLUMN IF NOT EXISTS footer_border_color     TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_color    TEXT,
  ADD COLUMN IF NOT EXISTS footer_link_color       TEXT,
  ADD COLUMN IF NOT EXISTS footer_copyright_color  TEXT;
