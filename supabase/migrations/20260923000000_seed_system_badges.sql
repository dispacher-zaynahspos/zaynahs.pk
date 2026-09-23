-- ============================================================
-- Migration: Seed Built-in System Badges (Featured, Hot, Sale, New)
-- ============================================================

INSERT INTO badges (id, name, bg_color, text_color)
VALUES
  ('00000000-0000-4000-8000-000000000002', 'Featured', '#e94560', '#ffffff'),
  ('00000000-0000-4000-8000-000000000004', 'HOT', '#ea580c', '#ffffff'),
  ('00000000-0000-4000-8000-000000000003', 'Sale', '#10b981', '#ffffff'),
  ('00000000-0000-4000-8000-000000000005', 'New', '#d97706', '#ffffff')
ON CONFLICT (id) DO UPDATE
SET bg_color = EXCLUDED.bg_color, text_color = EXCLUDED.text_color;
