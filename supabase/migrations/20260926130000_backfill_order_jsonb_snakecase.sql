-- Migration: backfill orders.items / orders.status_logs / abandoned_carts.items JSONB
-- from legacy camelCase keys to snake_case (RULE D13 — 100% snake, no data loss).
--
-- SAFETY: non-destructive + idempotent. Each element is REBUILT preserving values via
-- COALESCE(snake, camel); legacy camel keys are dropped only after the snake value is copied.
-- jsonb_strip_nulls prevents inserting null keys. Rows already in snake_case are unaffected.
--
-- NOTE: runtime is ALREADY safe without this migration (lib/services/orders/types.ts +
-- store/cartStore.ts normalize legacy camel on read). This migration is the permanent DB
-- cleanup. Apply per project via Supabase Management API and VERIFY a few rows before/after.

-- ── orders.items ────────────────────────────────────────────────────────────
UPDATE orders SET items = (
  SELECT COALESCE(jsonb_agg(
    (elem - 'selectedVariant' - 'selectedModifiers' - 'unitPrice'
          - 'discountAmount' - 'discountType' - 'discountValue' - 'addedLater')
    || jsonb_strip_nulls(jsonb_build_object(
      'selected_variant',   COALESCE(elem->'selected_variant',   elem->'selectedVariant'),
      'selected_modifiers', COALESCE(elem->'selected_modifiers', elem->'selectedModifiers'),
      'unit_price',         COALESCE(elem->'unit_price',         elem->'unitPrice'),
      'discount_amount',    COALESCE(elem->'discount_amount',    elem->'discountAmount'),
      'discount_type',      COALESCE(elem->'discount_type',      elem->'discountType'),
      'discount_value',     COALESCE(elem->'discount_value',     elem->'discountValue'),
      'added_later',        COALESCE(elem->'added_later',        elem->'addedLater')
    ))
  ), '[]'::jsonb)
  FROM jsonb_array_elements(items) AS elem
)
WHERE jsonb_typeof(items) = 'array'
  AND items::text ~ '(selectedVariant|selectedModifiers|unitPrice|discountAmount|discountType|discountValue|addedLater)';

-- ── orders.status_logs ──────────────────────────────────────────────────────
UPDATE orders SET status_logs = (
  SELECT COALESCE(jsonb_agg(
    (elem - 'createdAt')
    || jsonb_strip_nulls(jsonb_build_object(
      'created_at', COALESCE(elem->'created_at', elem->'createdAt')
    ))
  ), '[]'::jsonb)
  FROM jsonb_array_elements(status_logs) AS elem
)
WHERE jsonb_typeof(status_logs) = 'array'
  AND status_logs::text ~ 'createdAt';

-- ── abandoned_carts.items ───────────────────────────────────────────────────
UPDATE abandoned_carts SET items = (
  SELECT COALESCE(jsonb_agg(
    (elem - 'selectedVariant' - 'selectedModifiers' - 'unitPrice'
          - 'discountAmount' - 'discountType' - 'discountValue' - 'addedLater')
    || jsonb_strip_nulls(jsonb_build_object(
      'selected_variant',   COALESCE(elem->'selected_variant',   elem->'selectedVariant'),
      'selected_modifiers', COALESCE(elem->'selected_modifiers', elem->'selectedModifiers'),
      'unit_price',         COALESCE(elem->'unit_price',         elem->'unitPrice'),
      'discount_amount',    COALESCE(elem->'discount_amount',    elem->'discountAmount'),
      'discount_type',      COALESCE(elem->'discount_type',      elem->'discountType'),
      'discount_value',     COALESCE(elem->'discount_value',     elem->'discountValue'),
      'added_later',        COALESCE(elem->'added_later',        elem->'addedLater')
    ))
  ), '[]'::jsonb)
  FROM jsonb_array_elements(items) AS elem
)
WHERE jsonb_typeof(items) = 'array'
  AND items::text ~ '(selectedVariant|selectedModifiers|unitPrice|discountAmount|discountType|discountValue|addedLater)';
