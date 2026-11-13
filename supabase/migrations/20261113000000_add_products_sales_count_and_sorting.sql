-- Migration: Add sales_count to products table, populate from order_items, and update deduct_stock_for_order RPC

-- 1. Add sales_count column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. Backfill sales_count from existing order_items
UPDATE public.products p
SET sales_count = COALESCE(sub.total_qty, 0)
FROM (
  SELECT product_id, SUM(quantity)::INTEGER AS total_qty
  FROM public.order_items
  WHERE product_id IS NOT NULL AND quantity > 0
  GROUP BY product_id
) sub
WHERE p.id = sub.product_id;

-- 3. Update deduct_stock_for_order to increment products.sales_count atomically
CREATE OR REPLACE FUNCTION public.deduct_stock_for_order(p_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row    RECORD;
  v_count  INTEGER := 0;
  v_marked UUID;
BEGIN
  -- Idempotency guard: only the first call wins.
  UPDATE orders
     SET stock_deducted_at = NOW(),
         updated_at        = NOW()
   WHERE id = p_order_id
     AND stock_deducted_at IS NULL
  RETURNING id INTO v_marked;

  IF v_marked IS NULL THEN
    RETURN 0;
  END IF;

  FOR v_row IN
    SELECT product_id, variant_id, SUM(quantity)::INTEGER AS qty
      FROM order_items
     WHERE order_id = p_order_id
       AND product_id IS NOT NULL
       AND quantity > 0
     GROUP BY product_id, variant_id
  LOOP
    PERFORM adjust_item_stock(v_row.product_id, v_row.variant_id, -v_row.qty);

    -- Maintain public sales_count on products table
    UPDATE products
       SET sales_count = COALESCE(sales_count, 0) + v_row.qty
     WHERE id = v_row.product_id;

    v_count := v_count + 1;
  END LOOP;

  IF v_count > 0 THEN
    UPDATE orders
       SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
             jsonb_build_object(
               'id',         gen_random_uuid()::text,
               'type',       'status_change',
               'message',    'Inventory deducted and sales counted for ' || v_count || ' item line(s)',
               'created_at', NOW()::text
             )
           )
     WHERE id = p_order_id;
  END IF;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_stock_for_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deduct_stock_for_order(UUID) TO service_role;
REVOKE EXECUTE ON FUNCTION public.deduct_stock_for_order(UUID) FROM anon, authenticated;

-- 4. Create performance indexes for best selling and featured sorting
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON public.products (sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_sales ON public.products (is_active, deleted_at, sales_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products (is_active, deleted_at, is_featured DESC, created_at DESC);
