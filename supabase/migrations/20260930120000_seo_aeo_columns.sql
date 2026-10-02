-- ════════════════════════════════════════════════════════════════════════════
-- SEO / AEO column additions
-- Adds canonical + OG image overrides to seo_meta, and native meta fields to
-- categories. All additive + idempotent (ADD COLUMN IF NOT EXISTS) → safe to run
-- on any live store DB. Mirrored in supabase/schema/SUPER_MASTER_SCHEMA.sql.
-- ════════════════════════════════════════════════════════════════════════════

-- seo_meta: per-entity canonical URL + Open Graph image overrides
ALTER TABLE public.seo_meta ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.seo_meta ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.seo_meta ADD COLUMN IF NOT EXISTS og_image_alt TEXT;

-- categories: native SEO meta fields (previously only via seo_meta overrides)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_description TEXT;
