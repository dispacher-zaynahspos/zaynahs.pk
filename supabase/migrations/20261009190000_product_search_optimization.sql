-- ============================================================
-- PRODUCT SEARCH OPTIMIZATION MIGRATION
-- Adds full-text search vector, GIN index, and pg_trgm for fuzzy matching
-- Version: 1.0.0
-- Date: 2026-10-09
-- ============================================================

-- Enable pg_trgm extension for fuzzy/trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search_vector column to products table for full-text search
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index on search_vector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_vector 
ON public.products USING GIN (search_vector);

-- Create trigram indexes for fuzzy matching on key text columns
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON public.products USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm 
ON public.products USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_short_description_trgm 
ON public.products USING GIN (short_description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_sku_trgm 
ON public.products USING GIN (sku gin_trgm_ops);

-- Trigram index on variant attributes for variant search
CREATE INDEX IF NOT EXISTS idx_variants_color_trgm 
ON public.product_variants USING GIN (color gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_variants_size_trgm 
ON public.product_variants USING GIN (size gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_variants_material_trgm 
ON public.product_variants USING GIN (material gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_variants_custom_value_trgm 
ON public.product_variants USING GIN (custom_value gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_variants_sku_trgm 
ON public.product_variants USING GIN (sku gin_trgm_ops);

-- Function to build search vector from product and related data
CREATE OR REPLACE FUNCTION public.build_product_search_vector(p_id uuid)
RETURNS tsvector AS $$
DECLARE
  v_vector tsvector := ' ';
  v_product record;
  v_variants text := '';
  v_categories text := '';
  v_tags text := '';
BEGIN
  -- Get product data
  SELECT p.*, c.name as category_name
  INTO v_product
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.id = p_id;

  IF NOT FOUND THEN
    RETURN ' ';
  END IF;

  -- Weight A: name (highest priority)
  v_vector := v_vector || 
    setweight(to_tsvector('simple', coalesce(v_product.name, '')), 'A');

  -- Weight B: short_description, sku, category name
  v_vector := v_vector || 
    setweight(to_tsvector('simple', coalesce(v_product.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(v_product.sku, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(v_product.category_name, '')), 'B');

  -- Weight C: description, tags
  v_vector := v_vector || 
    setweight(to_tsvector('simple', coalesce(v_product.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(v_product.tags, ' '), '')), 'C');

  -- Get variant attributes
  SELECT string_agg(coalesce(color, '') || ' ' || coalesce(size, '') || ' ' || 
           coalesce(material, '') || ' ' || coalesce(custom_value, '') || ' ' || 
           coalesce(sku, ''), ' ')
  INTO v_variants
  FROM public.product_variants
  WHERE product_id = p_id AND active = true;

  IF v_variants != '' THEN
    v_vector := v_vector || setweight(to_tsvector('simple', v_variants), 'B');
  END IF;

  -- Get category names from product_categories junction
  SELECT string_agg(c.name, ' ')
  INTO v_categories
  FROM public.product_categories pc
  JOIN public.categories c ON pc.category_id = c.id
  WHERE pc.product_id = p_id;

  IF v_categories != '' THEN
    v_vector := v_vector || setweight(to_tsvector('simple', v_categories), 'B');
  END IF;

  RETURN v_vector;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger function to update search_vector on product changes
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := public.build_product_search_vector(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_product_search_vector ON public.products;

-- Create trigger to auto-update search_vector
CREATE TRIGGER trigger_update_product_search_vector
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector();

-- Function to update search vector for all products (run once after migration)
CREATE OR REPLACE FUNCTION public.refresh_all_product_search_vectors()
RETURNS void AS $$
BEGIN
  UPDATE public.products 
  SET search_vector = public.build_product_search_vector(id)
  WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run initial population
SELECT public.refresh_all_product_search_vectors();

-- Trigger functions to update product search_vector when related data changes
CREATE OR REPLACE FUNCTION public.update_product_search_vector_on_variant_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.products 
    SET search_vector = public.build_product_search_vector(NEW.product_id)
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products 
    SET search_vector = public.build_product_search_vector(OLD.product_id)
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_variant_search_vector ON public.product_variants;
CREATE TRIGGER trigger_variant_search_vector
AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector_on_variant_change();

CREATE OR REPLACE FUNCTION public.update_product_search_vector_on_category_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.products 
    SET search_vector = public.build_product_search_vector(NEW.product_id)
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products 
    SET search_vector = public.build_product_search_vector(OLD.product_id)
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_category_search_vector ON public.product_categories;
CREATE TRIGGER trigger_product_category_search_vector
AFTER INSERT OR UPDATE OR DELETE ON public.product_categories
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector_on_category_change();

CREATE OR REPLACE FUNCTION public.update_product_search_vector_on_category_rename()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public.products p
    SET search_vector = public.build_product_search_vector(p.id)
    FROM public.product_categories pc
    WHERE pc.product_id = p.id AND pc.category_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_category_rename_search_vector ON public.categories;
CREATE TRIGGER trigger_category_rename_search_vector
AFTER UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector_on_category_rename();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.build_product_search_vector(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_all_product_search_vectors() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_search_vector() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_search_vector_on_variant_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_search_vector_on_category_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_search_vector_on_category_rename() TO authenticated;

-- ============================================================
-- OPTIONAL: Add age fields to products for age-aware search
-- Uncomment if age-based search is needed
-- ============================================================
-- ALTER TABLE public.products 
-- ADD COLUMN IF NOT EXISTS recommended_age_min_months integer,
-- ADD COLUMN IF NOT EXISTS recommended_age_max_months integer,
-- ADD COLUMN IF NOT EXISTS age_group text;

-- CREATE INDEX IF NOT EXISTS idx_products_age_range 
-- ON public.products (recommended_age_min_months, recommended_age_max_months);

-- ============================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================
-- Check index creation:
-- \d public.products
-- \di idx_products_*

-- Test search vector:
-- SELECT id, name, search_vector FROM public.products WHERE is_active = true AND deleted_at IS NULL LIMIT 5;

-- Test full-text search:
-- SELECT id, name, ts_rank_cd(search_vector, plainto_tsquery('simple', 'shirt')) as rank
-- FROM public.products 
-- WHERE search_vector @@ plainto_tsquery('simple', 'shirt')
-- AND is_active = true AND deleted_at IS NULL
-- ORDER BY rank DESC LIMIT 10;

-- Test trigram similarity:
-- SELECT id, name, similarity(name, 'shert') as sim
-- FROM public.products 
-- WHERE name % 'shert'
-- AND is_active = true AND deleted_at IS NULL
-- ORDER BY sim DESC LIMIT 10;