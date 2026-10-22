-- ============================================================================
-- 2026-10-23 — STOCK DEDUCTION ON ORDER CREATION (opt-in, idempotent)
-- ============================================================================
-- PROBLEM (audit 2026-10-22): `createOrder` inserted the order + items but the
-- initial stock deduction was never performed. The lifecycle RPCs
-- (`restore_stock_on_cancel`, `adjust_stock_on_order_edit`) existed and were
-- called on cancel/edit, so the system *behaved* as if stock had been deducted
-- at checkout. Result: inventory never went down, and cancelling an order
-- inflated it.
--
-- SAFETY: this migration is additive and does NOT change live stock by itself.
-- Deduction is opt-in per store (`AUTO_DEDUCT_STOCK=true`), because stores that
-- adjust stock manually would otherwise be double-decremented.
--
--   orders.stock_deducted_at  → idempotency marker (NULL = not deducted)
--   deduct_stock_for_order()  → atomic, clamped at 0 via adjust_item_stock()
--   restore_stock_on_cancel() → restores only deducted orders; negative qty
--                               (un-cancel re-deduct) re-arms the marker
--   adjust_stock_on_order_edit() → no-op for orders that were never deducted
-- ============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_deducted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.stock_deducted_at IS
  'When inventory was deducted for this order. NULL = never deducted (legacy, manual-stock store, or auto-deduct disabled).';

-- ── Deduct stock for one order (idempotent) ────────────────────────────────
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
    v_count := v_count + 1;
  END LOOP;

  IF v_count > 0 THEN
    UPDATE orders
       SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
             jsonb_build_object(
               'id',         gen_random_uuid()::text,
               'type',       'status_change',
               'message',    'Inventory deducted for ' || v_count || ' item line(s)',
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

-- ── Restore / re-deduct, never inventing stock that was never deducted ─────
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel(
  p_order_id UUID,
  p_items    JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item         JSONB;
  v_product_id   UUID;
  v_variant_id   UUID;
  v_qty          INTEGER;
  v_count        INTEGER := 0;
  v_is_deduction BOOLEAN := FALSE;
  v_marked       UUID;
  v_deducted     TIMESTAMPTZ;
BEGIN
  -- mutate.ts calls this with NEGATIVE quantities when an order is un-cancelled
  -- (cancelled → confirmed) to deduct again.
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_items) e
     WHERE COALESCE((e->>'quantity')::INTEGER, 1) < 0
  ) INTO v_is_deduction;

  IF v_is_deduction THEN
    UPDATE orders
       SET stock_deducted_at = NOW(), updated_at = NOW()
     WHERE id = p_order_id
       AND stock_deducted_at IS NULL
    RETURNING id INTO v_marked;
    IF v_marked IS NULL THEN RETURN 0; END IF;
  ELSE
    SELECT stock_deducted_at INTO v_deducted FROM orders WHERE id = p_order_id;
    -- Legacy / manual-stock orders were never deducted → restoring would inflate.
    IF v_deducted IS NULL THEN RETURN 0; END IF;

    UPDATE orders
       SET stock_deducted_at = NULL, updated_at = NOW()
     WHERE id = p_order_id;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := COALESCE((v_item->>'product_id')::UUID, (v_item->'product'->>'id')::UUID);
    v_variant_id := COALESCE((v_item->>'variant_id')::UUID, (v_item->'selected_variant'->>'id')::UUID);
    v_qty        := COALESCE((v_item->>'quantity')::INTEGER, 1);
    IF v_product_id IS NOT NULL AND v_qty <> 0 THEN
      PERFORM adjust_item_stock(v_product_id, v_variant_id, v_qty);
      v_count := v_count + 1;
    END IF;
  END LOOP;

  UPDATE orders
     SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
           jsonb_build_object(
             'id',         gen_random_uuid()::text,
             'type',       'status_change',
             'message',    CASE WHEN v_is_deduction
                                THEN 'Inventory deducted (order re-opened)'
                                ELSE 'Inventory restored — all items returned to stock' END,
             'status',     CASE WHEN v_is_deduction THEN NULL ELSE 'cancelled' END,
             'created_at', NOW()::text
           )
         ),
         updated_at = NOW()
   WHERE id = p_order_id;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_stock_on_cancel(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_stock_on_cancel(UUID, JSONB) TO service_role;
REVOKE EXECUTE ON FUNCTION public.restore_stock_on_cancel(UUID, JSONB) FROM anon, authenticated;

-- ── Order edits: only adjust stock for orders that were actually deducted ──
CREATE OR REPLACE FUNCTION public.adjust_stock_on_order_edit(
  p_order_id  UUID,
  p_old_items JSONB,
  p_new_items JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item       JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_old_qty    INTEGER;
  v_new_qty    INTEGER;
  v_delta      INTEGER;
  v_count      INTEGER := 0;
BEGIN
  -- Never invent stock movements for legacy / manual-stock orders.
  IF (SELECT stock_deducted_at FROM orders WHERE id = p_order_id) IS NULL THEN
    RETURN 0;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS _inv_old (product_id UUID, variant_id UUID, qty INTEGER) ON COMMIT DROP;
  CREATE TEMP TABLE IF NOT EXISTS _inv_new (product_id UUID, variant_id UUID, qty INTEGER) ON COMMIT DROP;
  TRUNCATE _inv_old; TRUNCATE _inv_new;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_old_items) LOOP
    v_product_id := COALESCE((v_item->>'product_id')::UUID, (v_item->'product'->>'id')::UUID);
    v_variant_id := COALESCE((v_item->>'variant_id')::UUID, (v_item->'selected_variant'->>'id')::UUID);
    v_old_qty    := COALESCE((v_item->>'quantity')::INTEGER, 1);
    IF v_product_id IS NOT NULL THEN
      INSERT INTO _inv_old(product_id, variant_id, qty) VALUES(v_product_id, v_variant_id, v_old_qty) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_new_items) LOOP
    v_product_id := COALESCE((v_item->>'product_id')::UUID, (v_item->'product'->>'id')::UUID);
    v_variant_id := COALESCE((v_item->>'variant_id')::UUID, (v_item->'selected_variant'->>'id')::UUID);
    v_new_qty    := COALESCE((v_item->>'quantity')::INTEGER, 1);
    IF v_product_id IS NOT NULL THEN
      INSERT INTO _inv_new(product_id, variant_id, qty) VALUES(v_product_id, v_variant_id, v_new_qty) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  FOR v_product_id, v_variant_id, v_old_qty IN
    SELECT o.product_id, o.variant_id, o.qty FROM _inv_old o
    WHERE NOT EXISTS (SELECT 1 FROM _inv_new n WHERE n.product_id = o.product_id AND (n.variant_id IS NOT DISTINCT FROM o.variant_id))
  LOOP
    PERFORM adjust_item_stock(v_product_id, v_variant_id, v_old_qty);
    v_count := v_count + 1;
  END LOOP;

  FOR v_product_id, v_variant_id, v_new_qty IN
    SELECT n.product_id, n.variant_id, n.qty FROM _inv_new n
    WHERE NOT EXISTS (SELECT 1 FROM _inv_old o WHERE o.product_id = n.product_id AND (o.variant_id IS NOT DISTINCT FROM n.variant_id))
  LOOP
    PERFORM adjust_item_stock(v_product_id, v_variant_id, -v_new_qty);
    v_count := v_count + 1;
  END LOOP;

  FOR v_product_id, v_variant_id, v_old_qty, v_new_qty IN
    SELECT o.product_id, o.variant_id, o.qty, n.qty FROM _inv_old o
    JOIN _inv_new n ON n.product_id = o.product_id AND (n.variant_id IS NOT DISTINCT FROM o.variant_id)
    WHERE o.qty <> n.qty
  LOOP
    v_delta := v_old_qty - v_new_qty;
    PERFORM adjust_item_stock(v_product_id, v_variant_id, v_delta);
    v_count := v_count + 1;
  END LOOP;

  IF v_count > 0 THEN
    UPDATE orders
      SET status_logs = COALESCE(status_logs, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'type', 'status_change',
          'message', 'Inventory adjusted after order edit', 'created_at', NOW()::text)
      ), updated_at = NOW()
    WHERE id = p_order_id;
  END IF;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_stock_on_order_edit(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_stock_on_order_edit(UUID, JSONB, JSONB) TO service_role;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_on_order_edit(UUID, JSONB, JSONB) FROM anon, authenticated;
