-- Reviews correctness (additive, safe). Admin audit Phase-0 §3/§7.
-- 1) Product rating/count trigger must ignore soft-deleted reviews (was counting them).
-- 2) Public read policy must also exclude hidden/soft-deleted (was `approved=true` only).

CREATE OR REPLACE FUNCTION update_product_reviews_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN v_product_id := OLD.product_id; ELSE v_product_id := NEW.product_id; END IF;
  IF v_product_id IS NULL THEN RETURN NULL; END IF;

  UPDATE products
  SET
    reviews_count = (
      SELECT COALESCE(COUNT(*), 0) FROM reviews
      WHERE product_id = v_product_id AND approved = true
        AND COALESCE(hidden, false) = false AND deleted_at IS NULL
    ),
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews
      WHERE product_id = v_product_id AND approved = true
        AND COALESCE(hidden, false) = false AND deleted_at IS NULL
    ), 5.0)
  WHERE id = v_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recompute all products once so stored stats reflect the corrected rule.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT product_id FROM reviews WHERE product_id IS NOT NULL LOOP
    UPDATE products p SET
      reviews_count = (SELECT COALESCE(COUNT(*),0) FROM reviews WHERE product_id = r.product_id AND approved = true AND COALESCE(hidden,false)=false AND deleted_at IS NULL),
      rating = COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM reviews WHERE product_id = r.product_id AND approved = true AND COALESCE(hidden,false)=false AND deleted_at IS NULL), 5.0)
    WHERE p.id = r.product_id;
  END LOOP;
END $$;

-- Tighten public read policy (was approved-only; anon could read hidden/soft-deleted approved rows).
DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (approved = true AND COALESCE(hidden, false) = false AND deleted_at IS NULL);
