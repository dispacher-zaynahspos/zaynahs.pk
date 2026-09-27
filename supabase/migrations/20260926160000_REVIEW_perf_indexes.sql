-- ============================================================================
-- Pass 8 — Performance: additive indexes for hot query paths
-- ============================================================================
-- ⚠️ REVIEW BEFORE APPLYING. Additive-only (safe, non-destructive): creates
-- indexes that were missing on frequently filtered/sorted columns. No data or
-- schema is altered. See docs/AUDIT_PASS8_PERFORMANCE.md.
--
-- On a LARGE live table prefer running each as:
--   CREATE INDEX CONCURRENTLY ...   (outside a transaction, no write-lock)
-- The IF NOT EXISTS form below is transaction-safe for small/medium tables.
-- ============================================================================

-- 1) Shop-by-category: products are filtered via the product_categories junction.
--    PK is (product_id, category_id), so lookups by category_id alone are NOT
--    covered by the PK prefix. This is the storefront category page's hot path.
CREATE INDEX IF NOT EXISTS idx_product_categories_category
  ON public.product_categories (category_id);

-- 2) Admin Orders Log: sorted by newest and filtered by status.
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);

-- 3) Storefront catalog listing filters on active/featured products.
--    Partial index keeps it small (only the rows the storefront actually lists).
CREATE INDEX IF NOT EXISTS idx_products_active
  ON public.products (is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products (is_featured) WHERE is_featured = true AND deleted_at IS NULL;

-- Note: coupons.code (UNIQUE) and orders.order_number (UNIQUE) already have
-- implicit unique indexes — no action needed.
