-- Reviews: server-derived verified-purchase flag (compliance/trust).
-- "Verified Buyer" badge must reflect a REAL order, never be hardcoded.
-- Additive + reversible. Backfill matches review phone/email to any order.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;

UPDATE reviews r
SET is_verified_purchase = true
WHERE (r.is_verified_purchase IS DISTINCT FROM true)
  AND EXISTS (
    SELECT 1 FROM orders o
    WHERE (r.customer_phone IS NOT NULL
           AND NULLIF(regexp_replace(o.customer_phone, '[^0-9]', '', 'g'), '')
             = NULLIF(regexp_replace(r.customer_phone, '[^0-9]', '', 'g'), ''))
       OR (r.customer_email IS NOT NULL
           AND lower(o.customer_email) = lower(r.customer_email))
  );

-- Rollback:
-- ALTER TABLE reviews DROP COLUMN IF EXISTS is_verified_purchase;
