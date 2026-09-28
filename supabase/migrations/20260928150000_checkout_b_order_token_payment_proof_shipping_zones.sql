-- Checkout-B: public order-token page + payment proof + city/zone shipping engine.
-- Fully additive & backward-compatible. No column dropped or type-changed.
-- Rules: snake_case (D13), UUID PK (D14), RLS on every data table, additive migrations.

-- 1) orders.access_token — unguessable public handle for /order/[token] (no phone gate needed;
--    the token itself is the secret, like a Stripe receipt URL). Unique, nullable (backfilled below).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_token TEXT;

-- 2) orders.payment_proof_url — customer-uploaded payment screenshot (bank/wallet transfer proof).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Backfill tokens for existing orders that lack one (64 hex chars, collision-safe).
UPDATE orders
SET access_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE access_token IS NULL;

-- Enforce uniqueness once populated.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token ON orders(access_token);

-- 3) Shipping zones — city-based rate engine. A zone maps a set of cities to a flat cost
--    (and optional free-shipping threshold). Checkout resolves the entered city -> zone cost;
--    when no zone matches, it falls back to the selected flat shipping_method cost (unchanged behaviour).
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                         -- e.g. "Karachi Metro", "Rest of Pakistan"
  cities TEXT[] NOT NULL DEFAULT '{}',        -- normalized (lowercased) city names this zone serves
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_threshold NUMERIC(10,2),               -- NULL = no zone-level free shipping
  estimated_days TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,  -- catch-all zone for cities not explicitly listed
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(active, sort_order);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read shipping_zones" ON shipping_zones;
CREATE POLICY "Public read shipping_zones" ON shipping_zones FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admin all shipping_zones" ON shipping_zones;
CREATE POLICY "Admin all shipping_zones" ON shipping_zones FOR ALL USING (auth.role() = 'authenticated');
