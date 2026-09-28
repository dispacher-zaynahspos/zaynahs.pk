-- Reviews: on-demand aggregate RPCs (companion to the AFTER-trigger update_product_reviews_stats).
-- Additive + safe. Rule 05/D-series compliant (SECURITY DEFINER, snake_case).
--
-- WHY: the trigger keeps products.rating/reviews_count in sync on every write, but admin flows
-- (orphan review -> assign product, bulk repair) need an explicit, idempotent recompute they can
-- call directly. Storefront rating breakdown UIs need a distribution aggregate.

-- 1) Recompute a single product's stored aggregates on demand (idempotent).
CREATE OR REPLACE FUNCTION recompute_product_review_stats(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_product_id IS NULL THEN RETURN; END IF;
  UPDATE products
  SET
    reviews_count = (
      SELECT COALESCE(COUNT(*), 0) FROM reviews
      WHERE product_id = p_product_id AND approved = true
        AND COALESCE(hidden, false) = false AND deleted_at IS NULL
    ),
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews
      WHERE product_id = p_product_id AND approved = true
        AND COALESCE(hidden, false) = false AND deleted_at IS NULL
    ), 5.0)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) Recompute EVERY product (admin repair button / migration safety net).
CREATE OR REPLACE FUNCTION recompute_all_review_stats()
RETURNS VOID AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT product_id FROM reviews WHERE product_id IS NOT NULL LOOP
    PERFORM recompute_product_review_stats(r.product_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Rating distribution (1..5 star counts + total + average) for a product.
CREATE OR REPLACE FUNCTION get_product_rating_distribution(p_product_id UUID)
RETURNS TABLE (
  stars INTEGER,
  count BIGINT
) AS $$
  SELECT s.stars, COALESCE(COUNT(r.id), 0) AS count
  FROM generate_series(1, 5) AS s(stars)
  LEFT JOIN reviews r
    ON r.rating = s.stars
   AND r.product_id = p_product_id
   AND r.approved = true
   AND COALESCE(r.hidden, false) = false
   AND r.deleted_at IS NULL
  GROUP BY s.stars
  ORDER BY s.stars DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_product_rating_distribution(UUID) TO anon, authenticated;
