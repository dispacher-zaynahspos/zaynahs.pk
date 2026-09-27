-- Migration: fix schema drift found in DEEP_AUDIT_PLAN (D1, D2)
-- Adds columns that code already references but that were missing from the DB.
-- Additive + idempotent (safe to re-run).

-- D1: orders.customer_email (used by lib/services/orders + order-status emails; was always undefined)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- D2: shop products-per-page (base + responsive) used by the Homepage Customizer > Shop page
-- and read by components/store/shop-page/useShopPageFilters.ts. Were never persisted.
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS shop_products_per_page INTEGER DEFAULT 12;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS shop_products_per_page_desktop INTEGER DEFAULT 12;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS shop_products_per_page_tablet INTEGER DEFAULT 9;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS shop_products_per_page_mobile INTEGER DEFAULT 6;
