-- Migration: Announcement bar social icons (RULE SSOT1 — shared with footer socials)
-- Adds toggles so the header announcement bar can show the enabled social icons
-- on its right side, using the SAME social_* links the footer already uses.
--   header_social_enabled      default true  (show icons when socials configured)
--   header_social_show_mobile  default false (hidden on mobile unless enabled)
-- Existing stores look unchanged except the icons appear if socials are set.

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS header_social_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS header_social_show_mobile BOOLEAN DEFAULT false;
