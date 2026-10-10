-- ============================================================================
-- Per-category manual ordering: product_categories.position
-- ============================================================================
-- PROBLEM (decoupling bug): manual order for /shop + every category page was
-- stored in the single GLOBAL products.sort_order column. Reordering products
-- inside one category rewrote that global column, so the Home customizer
-- product sections AND every other category's order changed too.
--
-- FIX: give the product_categories join table its own per-category `position`.
-- Each (category_id, product_id) pair gets an independent rank. The global
-- products.sort_order is kept (legacy fallback) but is NO LONGER written by the
-- category/shop reorder flow.
--
-- BACKFILL: preserve exactly how every category/shop list looks TODAY by
-- seeding position from the current global products.sort_order ordering
-- (sort_order ASC, created_at DESC) within each category. Idempotent + additive.
--
-- REVERSIBLE: see the DOWN block at the bottom (commented) — drop the column +
-- index to fully restore prior behavior. No data loss on products.sort_order.
-- ============================================================================

-- 1. Column (additive, idempotent)
ALTER TABLE public.product_categories
  ADD COLUMN IF NOT EXISTS position INTEGER;

-- 2. Index for the per-category ordered read (category_id, position)
CREATE INDEX IF NOT EXISTS idx_product_categories_category_position
  ON public.product_categories (category_id, position);

-- 3. Backfill position per category from the CURRENT global ordering.
--    Only rows where position IS NULL are touched → re-running is safe and
--    never clobbers positions already set by the admin after this migration.
WITH ranked AS (
  SELECT
    pc.product_id,
    pc.category_id,
    ROW_NUMBER() OVER (
      PARTITION BY pc.category_id
      ORDER BY
        COALESCE(NULLIF(p.sort_order, 0), 2147483647) ASC,
        p.created_at DESC,
        p.id ASC
    ) AS rn
  FROM public.product_categories pc
  JOIN public.products p ON p.id = pc.product_id
  WHERE pc.position IS NULL
)
UPDATE public.product_categories pc
SET position = ranked.rn
FROM ranked
WHERE pc.product_id = ranked.product_id
  AND pc.category_id = ranked.category_id
  AND pc.position IS NULL;

-- 4. Default for future inserts handled in app layer (append to end). New rows
--    inserted without a position stay NULL and sort last via COALESCE fallback
--    until the admin saves an explicit order.

-- ============================================================================
-- DOWN (manual rollback — run only to fully revert):
-- DROP INDEX IF EXISTS public.idx_product_categories_category_position;
-- ALTER TABLE public.product_categories DROP COLUMN IF EXISTS position;
-- ============================================================================

-- 5. Atomic per-category reorder RPC (RULE D15 — fully succeed or fully fail).
--    Rewrites `position` = array index + 1 for the given category in ONE
--    transaction. Products not in the array are pushed to the end (NULL kept),
--    so a page-local move still produces a correct GLOBAL per-category order
--    because the caller always sends the full ordered id list for the category.
CREATE OR REPLACE FUNCTION public.reorder_category_products(
  p_category_id UUID,
  p_product_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_categories pc
  SET position = idx.ord
  FROM (
    SELECT unnest(p_product_ids) AS product_id,
           generate_subscripts(p_product_ids, 1) AS ord
  ) idx
  WHERE pc.category_id = p_category_id
    AND pc.product_id = idx.product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reorder_category_products(UUID, UUID[]) TO authenticated, service_role;

