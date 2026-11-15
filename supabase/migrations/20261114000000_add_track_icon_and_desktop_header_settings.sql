-- Migration: 20261114000000_add_track_icon_and_desktop_header_settings.sql
-- Description: Add track order element alignment and desktop header icons reorderable settings to store_settings

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS header_desktop_track_align TEXT DEFAULT 'right',
  ADD COLUMN IF NOT EXISTS header_mobile_track_align TEXT DEFAULT 'hidden',
  ADD COLUMN IF NOT EXISTS desktop_header_icons JSONB DEFAULT NULL;
