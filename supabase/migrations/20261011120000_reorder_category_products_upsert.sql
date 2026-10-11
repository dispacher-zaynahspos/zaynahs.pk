-- ============================================================================
-- Fix per-category reorder for products linked ONLY via products.category_id
-- ============================================================================
-- PROBLEM: reorder_category_products() only UPDATEs existing product_categories
-- join rows. A product attached to a category via the legacy products.category_id
-- column (with no product_categories row) is shown + sent by the admin reorder,
-- but the UPDATE ... WHERE pc.product_id = ... matches nothing → its manual
-- position is silently dropped and never persists.
--
-- FIX: make the RPC ensure a join row exists for every id in the ordered array
-- (INSERT ... ON CONFLICT DO NOTHING using the product's own category_id link),
-- then set position = array index + 1 in ONE transaction (RULE D15). Fully
-- additive + idempotent; still SECURITY DEFINER + same grants.
-- ============================================================================

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
  -- 1. Ensure a join row exists for every product in the ordered list that is
  --    legitimately linked to this category (either already joined, or linked
  --    via the legacy products.category_id column). Never fabricates links for
  --    unrelated products.
  INSERT INTO public.product_categories (product_id, category_id)
  SELECT pid, p_category_id
  FROM unnest(p_product_ids) AS pid
  WHERE EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = pid AND p.category_id = p_category_id
  )
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- 2. Write the per-category manual order (1-based) in one atomic pass.
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
