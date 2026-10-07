-- Footer social-icon color columns
-- Root cause fix: FooterSocialLinks + Settings (Footer & Social) + Customizer (Global ->
-- Footer & Social) read/write editable social icon colors (default + hover icon/bg) via
-- shared keys, but these columns were never present in the live DB, so the social-icon
-- color edits could not persist. Adding them also backs the hover-visibility fix (the
-- hover icon/background are now explicit, contrast-safe, editable colors).
-- Additive + idempotent.

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS footer_social_icon_color  TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_icon_bg     TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_hover_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_hover_bg    TEXT;
