-- Auto-purge unrecovered abandoned carts older than 30 days
-- Prevents database storage bloat from accumulating anonymous shopper cart sessions.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('purge-abandoned-carts-30-days')
FROM cron.job
WHERE jobname = 'purge-abandoned-carts-30-days';

SELECT cron.schedule(
  'purge-abandoned-carts-30-days',
  '30 3 * * *',
  $$ DELETE FROM public.abandoned_carts WHERE last_activity < NOW() - INTERVAL '30 days' AND order_placed = false; $$
);
