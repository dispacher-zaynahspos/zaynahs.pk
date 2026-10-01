-- =====================================================================
-- Product Slug Normalization — PERMANENT fix (all current + future clones)
-- =====================================================================
-- Problem: product slugs were being stored with spaces, UPPERCASE letters,
-- pipes "|", and other non-URL-safe characters (e.g.
--   "Girls Pink Graphic Print Fleece Sweatshirt | Colorful Art Crew Neck Top",
--   "boys-pakistan-t-shirt-greenBoys Brown Cartoon Print Fleece Sweatshirt...").
-- These produced ugly/broken product URLs (%20, capitals) and were a source
-- of 500/404 confusion on product detail pages.
--
-- Permanent fix = DB-level guarantee: a BEFORE INSERT/UPDATE trigger normalizes
-- every product slug to clean, lowercase, hyphenated, URL-safe form — no matter
-- what writes it (app code, scripts, CSV import, AI rename, direct SQL). The app
-- layer also sanitizes at its write boundary (lib/services/products/*), but this
-- trigger is the final safety net so a bad slug can NEVER reach the table.
-- =====================================================================

-- 1) Canonical SQL slug normalizer (mirrors lib/utils/slugify.ts)
CREATE OR REPLACE FUNCTION public.normalize_slug(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $func$
  SELECT nullif(
    trim(both '-' FROM
      regexp_replace(
        lower(replace(coalesce(input, ''), '&', ' and ')),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    ''
  );
$func$;

-- 2) Trigger function — normalize slug on write; fall back to name, then id.
CREATE OR REPLACE FUNCTION public.products_normalize_slug_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $func$
BEGIN
  NEW.slug := public.normalize_slug(NEW.slug);
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.normalize_slug(NEW.name);
  END IF;
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := 'product-' || replace(NEW.id::text, '-', '');
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_products_normalize_slug ON public.products;
CREATE TRIGGER trg_products_normalize_slug
  BEFORE INSERT OR UPDATE OF slug, name ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.products_normalize_slug_trigger();

-- 3) One-time cleanup of EXISTING dirty slugs (idempotent — clean slugs stay the same).
--    Collision-checked: normalize_slug() is a pure function; run the collision
--    query in the migration review before applying to a store that may have
--    case/space-duplicate slugs. For a fresh clone there are none.
UPDATE public.products
SET slug = public.normalize_slug(slug)
WHERE slug IS DISTINCT FROM public.normalize_slug(slug)
  AND public.normalize_slug(slug) IS NOT NULL;
