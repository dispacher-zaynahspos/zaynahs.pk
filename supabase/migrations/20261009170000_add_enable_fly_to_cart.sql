-- Add enable_fly_to_cart toggle to store_settings
-- Controls universal thumbnail flight to header cart (with anticipation dip & bounce) independently from button tactile styles.
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS enable_fly_to_cart BOOLEAN DEFAULT true;
