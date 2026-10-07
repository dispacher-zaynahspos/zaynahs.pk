-- Product listing performance indexes
-- The hot storefront + admin product query filters WHERE is_active = true AND
-- deleted_at IS NULL and sorts by sort_order, created_at. Without a composite
-- index this is a sequential scan + sort on every cache-miss / admin load.
-- Additive + idempotent (CREATE INDEX IF NOT EXISTS).

-- Storefront active-listing path: filter (is_active, deleted_at) + sort (sort_order, created_at)
CREATE INDEX IF NOT EXISTS idx_products_active_sort
  ON products (is_active, deleted_at, sort_order, created_at DESC);

-- Admin inventory path: all non-deleted, newest first
CREATE INDEX IF NOT EXISTS idx_products_deleted_created
  ON products (deleted_at, created_at DESC);

-- Category-scoped active listing (category pages / per-category grids)
CREATE INDEX IF NOT EXISTS idx_products_category_active
  ON products (category_id, is_active, deleted_at);

-- Featured / sale grids read is_featured frequently
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (is_featured) WHERE is_featured = true;
