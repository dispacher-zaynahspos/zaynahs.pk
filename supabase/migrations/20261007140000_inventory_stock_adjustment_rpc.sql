-- ============================================================
-- MIGRATION: 20261007140000_inventory_stock_adjustment_rpc.sql
-- Atomic inventory adjustment RPC for order cancel / edit / restore.
-- Called from server-side only (service role). Never from client.
-- RULES: D15 (atomic writes), D1 (variant stock mandatory), D13 (snake_case)
-- ============================================================

-- ============================================================
-- FUNCTION: adjust_item_stock
-- Adjusts stock for one product/variant by delta (positive = add back, negative = deduct).
-- Clamps to 0 minimum (never goes negative).
-- Runs INSIDE a caller transaction — not standalone.
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_item_stock(
  p_product_id  UUID,
  p_variant_id  UUID,
  p_delta       INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_variant_id IS NOT NULL THEN
    -- Adjust variant stock
    UPDATE product_variants
      SET stock = GREATEST(0, stock + p_delta),
          updated_at = NOW()
      WHERE id = p_variant_id
        AND product_id = p_product_id;

    -- Re-sync products.stock = sum of all active variants
    UPDATE products
      SET stock = COALESCE((
            SELECT SUM(pv.stock)
            FROM product_variants pv
            WHERE pv.product_id = p_product_id
          ), 0),
          updated_at = NOW()
      WHERE id = p_product_id;
  ELSE
    -- Simple product (no variants)
    UPDATE products
      SET stock = GREATEST(0, stock + p_delta),
          updated_at = NOW()
      WHERE id = p_product_id
        AND is_service = false; -- never touch stock for service items
  END IF;
END;
$$;

-- ============================================================
-- FUNCTION: restore_stock_on_cancel
-- Called when an order is cancelled or moved to trash.
-- Accepts a JSONB array of order items from orders.items column.
-- Returns the number of stock lines restored.
-- Full transaction — all or nothing (D15).
-- ============================================================
CREATE OR REPLACE FUNCTION restore_stock_on_cancel(
  p_order_id UUID,
  p_items    JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item       JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty        INTEGER;
  v_count      INTEGER := 0;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Support both camelCase legacy (orders.items stored camelCase per D13 exception)
    -- and snake_case. Try both field paths.
    v_product_id := COALESCE(
      (v_item->>'product_id')::UUID,
      (v_item->'product'->>'id')::UUID
    );
    v_variant_id := COALESCE(
      (v_item->>'variant_id')::UUID,
      (v_item->'selected_variant'->>'id')::UUID
    );
    v_qty := COALESCE(
      (v_item->>'quantity')::INTEGER,
      1
    );

    -- Only restore stock for real products (non-null product_id)
    -- Service items: is_service check happens inside adjust_item_stock
    IF v_product_id IS NOT NULL AND v_qty > 0 THEN
      PERFORM adjust_item_stock(v_product_id, v_variant_id, v_qty);
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- Log the stock restoration event in the order timeline
  UPDATE orders
    SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'id',         gen_random_uuid()::text,
        'type',       'status_change',
        'message',    'Inventory restored — all items returned to stock',
        'status',     'cancelled',
        'created_at', NOW()::text
      )
    ),
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN v_count;
END;
$$;

-- ============================================================
-- FUNCTION: adjust_stock_on_order_edit
-- Called when admin edits order items (add/remove/qty change).
-- p_old_items: items before edit, p_new_items: items after edit.
-- Calculates delta per product/variant and adjusts stock.
-- Returns number of lines touched.
-- Full transaction — all or nothing (D15).
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_stock_on_order_edit(
  p_order_id  UUID,
  p_old_items JSONB,
  p_new_items JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item       JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_old_qty    INTEGER;
  v_new_qty    INTEGER;
  v_delta      INTEGER;
  v_count      INTEGER := 0;
  v_changes    TEXT    := '';

  -- Aggregate: (product_id, variant_id) -> (old_qty, new_qty)
  -- We use temp arrays since PL/pgSQL lacks native hashmaps.
  -- Strategy: iterate old items summing into temp table, then new items,
  -- then compute deltas.
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _inv_old (
    product_id UUID,
    variant_id UUID,
    qty        INTEGER
  ) ON COMMIT DROP;

  CREATE TEMP TABLE IF NOT EXISTS _inv_new (
    product_id UUID,
    variant_id UUID,
    qty        INTEGER
  ) ON COMMIT DROP;

  TRUNCATE _inv_old;
  TRUNCATE _inv_new;

  -- Populate old quantities
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_old_items)
  LOOP
    v_product_id := COALESCE((v_item->>'product_id')::UUID, (v_item->'product'->>'id')::UUID);
    v_variant_id := COALESCE((v_item->>'variant_id')::UUID, (v_item->'selected_variant'->>'id')::UUID);
    v_old_qty    := COALESCE((v_item->>'quantity')::INTEGER, 1);
    IF v_product_id IS NOT NULL THEN
      INSERT INTO _inv_old(product_id, variant_id, qty)
        VALUES(v_product_id, v_variant_id, v_old_qty)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Populate new quantities
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_new_items)
  LOOP
    v_product_id := COALESCE((v_item->>'product_id')::UUID, (v_item->'product'->>'id')::UUID);
    v_variant_id := COALESCE((v_item->>'variant_id')::UUID, (v_item->'selected_variant'->>'id')::UUID);
    v_new_qty    := COALESCE((v_item->>'quantity')::INTEGER, 1);
    IF v_product_id IS NOT NULL THEN
      INSERT INTO _inv_new(product_id, variant_id, qty)
        VALUES(v_product_id, v_variant_id, v_new_qty)
        ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Items removed entirely (in old, not in new) → restore stock
  FOR v_product_id, v_variant_id, v_old_qty IN
    SELECT o.product_id, o.variant_id, o.qty
    FROM _inv_old o
    WHERE NOT EXISTS (
      SELECT 1 FROM _inv_new n
      WHERE n.product_id = o.product_id
        AND (n.variant_id IS NOT DISTINCT FROM o.variant_id)
    )
  LOOP
    PERFORM adjust_item_stock(v_product_id, v_variant_id, v_old_qty);
    v_changes := v_changes || format('+ restored %s (qty %s); ', v_product_id, v_old_qty);
    v_count   := v_count + 1;
  END LOOP;

  -- Items added new (in new, not in old) → deduct stock
  FOR v_product_id, v_variant_id, v_new_qty IN
    SELECT n.product_id, n.variant_id, n.qty
    FROM _inv_new n
    WHERE NOT EXISTS (
      SELECT 1 FROM _inv_old o
      WHERE o.product_id = n.product_id
        AND (o.variant_id IS NOT DISTINCT FROM n.variant_id)
    )
  LOOP
    PERFORM adjust_item_stock(v_product_id, v_variant_id, -v_new_qty);
    v_changes := v_changes || format('- deducted %s (qty %s); ', v_product_id, v_new_qty);
    v_count   := v_count + 1;
  END LOOP;

  -- Items in both → apply quantity delta
  FOR v_product_id, v_variant_id, v_old_qty, v_new_qty IN
    SELECT o.product_id, o.variant_id, o.qty, n.qty
    FROM _inv_old o
    JOIN _inv_new n ON n.product_id = o.product_id
      AND (n.variant_id IS NOT DISTINCT FROM o.variant_id)
    WHERE o.qty <> n.qty
  LOOP
    -- delta: positive means qty reduced → return to stock; negative means qty increased → deduct
    v_delta := v_old_qty - v_new_qty;
    PERFORM adjust_item_stock(v_product_id, v_variant_id, v_delta);
    v_changes := v_changes || format('~ qty delta %s for %s; ', v_delta, v_product_id);
    v_count   := v_count + 1;
  END LOOP;

  -- Log the edit event if any changes occurred
  IF v_count > 0 THEN
    UPDATE orders
      SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id',         gen_random_uuid()::text,
          'type',       'status_change',
          'message',    'Inventory adjusted after order edit',
          'notes',      v_changes,
          'created_at', NOW()::text
        )
      ),
      updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  RETURN v_count;
END;
$$;

-- Grant EXECUTE to service role only (RLS: no client access)
GRANT EXECUTE ON FUNCTION adjust_item_stock(UUID, UUID, INTEGER)        TO service_role;
GRANT EXECUTE ON FUNCTION restore_stock_on_cancel(UUID, JSONB)          TO service_role;
GRANT EXECUTE ON FUNCTION adjust_stock_on_order_edit(UUID, JSONB, JSONB) TO service_role;

-- Revoke from anon and authenticated (server-only, never client-callable)
REVOKE EXECUTE ON FUNCTION adjust_item_stock(UUID, UUID, INTEGER)        FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION restore_stock_on_cancel(UUID, JSONB)          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION adjust_stock_on_order_edit(UUID, JSONB, JSONB) FROM anon, authenticated;
