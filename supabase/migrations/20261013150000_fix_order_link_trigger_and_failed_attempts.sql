-- ============================================================================
-- Migration: Fix order linking trigger & create failed_order_attempts table
-- Timestamp: 20261013150000
-- 
-- 1. SECURITY DEFINER + Exception Shield on link_order_to_abandoned_cart():
--    Fixes 42501 permission denied error when anon (guest checkout) inserts into orders.
--    Ensures auxiliary cart-linking can NEVER abort or roll back an order insertion.
-- 2. Add idempotency_key to orders table for safe duplicate submission protection.
-- 3. Create failed_order_attempts table with RLS to log and recover any failed orders.
-- ============================================================================

-- 1. Orders idempotency key
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

-- 2. Fixed trigger function with SECURITY DEFINER and exception shield
CREATE OR REPLACE FUNCTION public.link_order_to_abandoned_cart()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  BEGIN
    -- Extract digits from customer phone to perform clean comparison
    IF NEW.customer_phone IS NOT NULL THEN
      v_phone := regexp_replace(NEW.customer_phone, '\D', '', 'g');
    END IF;

    -- Match any unrecovered abandoned cart for the customer and mark as recovered/ordered
    IF v_phone IS NOT NULL AND v_phone <> '' THEN
      UPDATE abandoned_carts
      SET order_placed = true,
          order_id = NEW.id,
          recovered_at = NOW(),
          updated_at = NOW()
      WHERE order_placed = false
        AND (
          (customer_phone IS NOT NULL AND regexp_replace(customer_phone, '\D', '', 'g') = v_phone)
          OR
          (customer_phone = NEW.customer_phone)
        );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Auxiliary marketing trigger must NEVER fail or rollback a customer order
    RAISE WARNING 'link_order_to_abandoned_cart ignored exception: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_order_to_abandoned_cart() TO anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trigger_link_order_to_abandoned_cart ON public.orders;
CREATE TRIGGER trigger_link_order_to_abandoned_cart
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.link_order_to_abandoned_cart();

-- 3. Failed order attempts table for admin visibility & customer recovery
CREATE TABLE IF NOT EXISTS public.failed_order_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  shipping_method_name TEXT,
  shipping_address JSONB,
  payment_method_name TEXT,
  error_code TEXT,
  error_message TEXT,
  user_agent TEXT,
  idempotency_key TEXT,
  recovered_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_order_attempts_created_at 
  ON public.failed_order_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_failed_order_attempts_phone 
  ON public.failed_order_attempts(customer_phone);

CREATE INDEX IF NOT EXISTS idx_failed_order_attempts_idempotency 
  ON public.failed_order_attempts(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.failed_order_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all failed_order_attempts" ON public.failed_order_attempts;
CREATE POLICY "Admin all failed_order_attempts" ON public.failed_order_attempts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert failed_order_attempts" ON public.failed_order_attempts;
CREATE POLICY "Public insert failed_order_attempts" ON public.failed_order_attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

GRANT ALL ON public.failed_order_attempts TO service_role;
GRANT INSERT ON public.failed_order_attempts TO anon, authenticated;
GRANT SELECT ON public.failed_order_attempts TO authenticated;

-- 4. Store settings WhatsApp redirect toggle
ALTER TABLE public.store_settings 
  ADD COLUMN IF NOT EXISTS enable_whatsapp_redirect BOOLEAN DEFAULT true;

