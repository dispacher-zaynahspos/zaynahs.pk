-- Add webhook revalidation triggers for Collections
DROP TRIGGER IF EXISTS "revalidate-collections" ON public.collections;
CREATE TRIGGER "revalidate-collections"
  AFTER INSERT OR UPDATE OR DELETE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://domain.com/api/revalidate', 'POST', '{"Content-Type":"application/json","x-revalidate-secret":"zaynahs_secret_cache_revalidate_2026"}', '{}', '5000');

DROP TRIGGER IF EXISTS "revalidate-collection_categories" ON public.collection_categories;
CREATE TRIGGER "revalidate-collection_categories"
  AFTER INSERT OR UPDATE OR DELETE ON public.collection_categories
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://domain.com/api/revalidate', 'POST', '{"Content-Type":"application/json","x-revalidate-secret":"zaynahs_secret_cache_revalidate_2026"}', '{}', '5000');
