-- Migration: Review store reply + featured/order columns
-- Adds a public store reply + pin/feature + manual order to reviews so the admin
-- can reply, pin and reorder featured reviews, shown under the review on the store.
-- All nullable/defaulted so existing rows are unaffected.

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS store_reply TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews (approved, hidden, created_at DESC);
