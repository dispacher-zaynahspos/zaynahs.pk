-- Orders: real payment & fulfillment status + tags (additive, safe, backward-compatible).
-- Replaces the fragile "paid" derivation that string-sniffed orders.notes.
-- Defaults preserve current behaviour: everything starts unpaid/unfulfilled (COD default).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'unfulfilled',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Best-effort one-time backfill from the legacy single `status` column so existing
-- orders show sensible badges (non-destructive; only sets the new columns):
UPDATE public.orders
  SET fulfillment_status = 'fulfilled'
  WHERE fulfillment_status = 'unfulfilled'
    AND status IN ('shipped','delivered','out_for_delivery');
UPDATE public.orders
  SET payment_status = 'paid'
  WHERE payment_status = 'unpaid'
    AND status = 'delivered';
UPDATE public.orders
  SET payment_status = 'refunded'
  WHERE payment_status = 'unpaid'
    AND COALESCE(refund_amount, 0) > 0;
