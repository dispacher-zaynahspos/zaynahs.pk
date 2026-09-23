-- ============================================================
-- Migration: Seed Built-in System Badges (Featured, Hot, Sale, New)
-- ============================================================

INSERT INTO badges (id, name, bg_color, text_color)
VALUES
  ('00000000-0000-4000-8000-000000000002', 'Featured', '#e94560', '#ffffff'),
  ('00000000-0000-4000-8000-000000000004', 'HOT', '#ff9500', '#ffffff'),
  ('00000000-0000-4000-8000-000000000003', 'Sale', '#0f172a', '#ffffff'),
  ('00000000-0000-4000-8000-000000000005', 'New', '#10b981', '#ffffff')
ON CONFLICT (id) DO UPDATE
SET bg_color = EXCLUDED.bg_color, text_color = EXCLUDED.text_color;
