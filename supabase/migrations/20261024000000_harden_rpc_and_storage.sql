-- ============================================================================
-- 2026-10-24 — HARDEN RPC GRANTS + STORAGE POLICIES
-- ============================================================================
-- Audit follow-up (2026-10-23 sweep):
--   1. SECURITY DEFINER functions were still EXECUTE-able by `anon`:
--      adjust_item_stock  → anyone could change stock via PostgREST RPC
--      get_traffic_stats  → analytics leak
--      recompute_*        → expensive DoS
--      reorder_category_products → anyone could reorder a category
--   2. storage.objects had `Public Insert/Update/Delete product-images`
--      (roles public, no check) → anyone could upload, overwrite or DELETE
--      product images with the public anon key.
--   3. failed_order_attempts "Admin all" was `roles={authenticated} qual=true`
--      (missed by the auth.role() rewrite) → any authenticated user could read
--      failed-order PII.
--   4. media_library had `Public read ... qual=true`.
--
-- Nothing here changes read behaviour for the storefront: public product
-- images stay public, the storefront never calls these RPCs, and all admin
-- flows run with an authenticated admin session (public.is_admin()).
-- ============================================================================

-- ── 1. Reorder RPC: keep it callable by admins only (called from admin UI) ──
CREATE OR REPLACE FUNCTION public.reorder_category_products(
  p_category_id uuid,
  p_product_ids uuid[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.product_categories (product_id, category_id)
  SELECT pid, p_category_id
  FROM unnest(p_product_ids) AS pid
  WHERE EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = pid AND p.category_id = p_category_id
  )
  ON CONFLICT (product_id, category_id) DO NOTHING;

  UPDATE public.product_categories pc
  SET position = idx.ord
  FROM (
    SELECT unnest(p_product_ids) AS product_id,
           generate_subscripts(p_product_ids, 1) AS ord
  ) idx
  WHERE pc.category_id = p_category_id
    AND pc.product_id = idx.product_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.reorder_category_products(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_category_products(uuid, uuid[]) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.reorder_category_products(uuid, uuid[]) FROM anon;

-- ── 2. Service-role only for every other privileged RPC ─────────────────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'adjust_item_stock',
        'restore_stock_on_cancel',
        'adjust_stock_on_order_edit',
        'deduct_stock_for_order',
        'get_traffic_stats',
        'increment_ai_usage',
        'recompute_all_review_stats',
        'recompute_product_review_stats',
        'update_product_reviews_stats',
        'link_order_to_abandoned_cart',
        'refresh_all_product_search_vectors',
        'generate_order_number'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- ── 3. Storage: public READ only; writes = admin only ──────────────────────
DROP POLICY IF EXISTS "Public Insert product-images"  ON storage.objects;
DROP POLICY IF EXISTS "Public Update product-images"  ON storage.objects;
DROP POLICY IF EXISTS "Public Delete product-images"  ON storage.objects;
DROP POLICY IF EXISTS "Public Read product-images"    ON storage.objects;
DROP POLICY IF EXISTS "Public read product images"    ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin update product images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product images"   ON storage.objects;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ── 4. failed_order_attempts: admin predicate + no anon insert ─────────────
DROP POLICY IF EXISTS "Admin all failed_order_attempts" ON public.failed_order_attempts;
CREATE POLICY "Admin all failed_order_attempts"
  ON public.failed_order_attempts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public insert failed_order_attempts" ON public.failed_order_attempts;
REVOKE INSERT ON public.failed_order_attempts FROM anon, authenticated;

-- ── 5. media_library is admin metadata, not storefront content ─────────────
DROP POLICY IF EXISTS "Public read media_library" ON public.media_library;
REVOKE SELECT ON public.media_library FROM anon;
