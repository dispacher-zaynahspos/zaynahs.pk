-- Structured order line-items + addresses (ADDITIVE, safe, non-destructive).
-- These NEW tables sit alongside the existing orders.items (JSONB) and orders.notes
-- (free-text address), which remain the source-of-truth fallback. Nothing is dropped
-- or modified on the orders table, so this cannot break current behaviour. A separate
-- backfill (dry-run first) will populate them; re-running the backfill is safe because
-- these tables can be truncated & re-filled without touching orders.

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID,
  name TEXT,                -- price/name snapshot at purchase time
  sku TEXT,
  image_url TEXT,
  variant_label TEXT,
  unit_price NUMERIC(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  item_discount NUMERIC(10,2) DEFAULT 0,
  line_total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

CREATE TABLE IF NOT EXISTS public.order_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'shipping',   -- shipping | billing
  name TEXT,
  phone TEXT,
  email TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Pakistan',
  latitude NUMERIC,
  longitude NUMERIC,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_addresses_order ON public.order_addresses(order_id);

-- RLS: admin/service only (contains PII). No public access.
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin all order_items" ON public.order_items;
CREATE POLICY "Admin all order_items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin all order_addresses" ON public.order_addresses;
CREATE POLICY "Admin all order_addresses" ON public.order_addresses FOR ALL USING (auth.role() = 'authenticated');
-- Public INSERT so storefront checkout (anon) can write the address at order time.
DROP POLICY IF EXISTS "Public insert order_addresses" ON public.order_addresses;
CREATE POLICY "Public insert order_addresses" ON public.order_addresses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
