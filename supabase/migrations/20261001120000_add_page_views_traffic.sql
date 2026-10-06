-- ============================================================================
-- PAGE VIEWS — first-party traffic analytics (real data, no external deps)
-- ----------------------------------------------------------------------------
-- Replaces the Cloudflare-estimate traffic system with a first-party, accurate,
-- self-cleaning store. Every storefront navigation is logged via /api/track.
--   - Accurate: real pageviews + unique visitors (visitor_id), country + city
--   - Free: ~100 bytes/row; 90-day pg_cron purge keeps the table tiny (<10 MB)
--   - Any range: 24h / 7d / 30d / 90d / custom date-to-date via get_traffic_stats
-- D13 snake_case . D14 UUID PK . RLS on . auto-purge (no manual cleanup).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path       TEXT NOT NULL,
  country    TEXT,
  city       TEXT,
  visitor_id TEXT,
  referrer   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_country    ON public.page_views (country);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views (visitor_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
CREATE POLICY "Public insert page_views" ON public.page_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin all page_views" ON public.page_views;
CREATE POLICY "Admin all page_views" ON public.page_views
  FOR ALL USING (auth.role() = 'authenticated');

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_views TO service_role;

-- ----------------------------------------------------------------------------
-- Aggregation RPC — all grouping done in Postgres (fast, low egress).
-- Returns totals + per-country + per-city for ANY [p_start, p_end] window,
-- powering 24h / 7d / 30d / 90d / custom-range in one call.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_traffic_stats(p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'totalPageviews', (
      SELECT count(*) FROM page_views
      WHERE created_at >= p_start AND created_at <= p_end
    ),
    'totalVisitors', (
      SELECT count(DISTINCT visitor_id) FROM page_views
      WHERE created_at >= p_start AND created_at <= p_end
    ),
    'countries', COALESCE((
      SELECT jsonb_agg(row_to_json(c)) FROM (
        SELECT country AS code,
               count(DISTINCT visitor_id) AS visitors,
               count(*) AS pageviews
        FROM page_views
        WHERE created_at >= p_start AND created_at <= p_end
          AND country IS NOT NULL AND country <> ''
        GROUP BY country
        ORDER BY visitors DESC
        LIMIT 100
      ) c
    ), '[]'::jsonb),
    'cities', COALESCE((
      SELECT jsonb_agg(row_to_json(c)) FROM (
        SELECT city,
               country,
               count(DISTINCT visitor_id) AS visitors
        FROM page_views
        WHERE created_at >= p_start AND created_at <= p_end
          AND city IS NOT NULL AND city <> ''
        GROUP BY city, country
        ORDER BY visitors DESC
        LIMIT 100
      ) c
    ), '[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_traffic_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

-- ----------------------------------------------------------------------------
-- Auto-purge: keep only the last 90 days (= our max "last 3 months" range).
-- Runs inside Postgres daily — DB never fills, no Vercel/manual cleanup needed.
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('purge-page-views-90-days')
FROM cron.job
WHERE jobname = 'purge-page-views-90-days';

SELECT cron.schedule(
  'purge-page-views-90-days',
  '0 3 * * *',
  $$ DELETE FROM public.page_views WHERE created_at < NOW() - INTERVAL '90 days' $$
);
