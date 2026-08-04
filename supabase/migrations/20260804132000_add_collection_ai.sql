-- Add Collection AI Settings Columns to store_settings table
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS collection_default_template TEXT DEFAULT '<p>Explore our exclusively curated <strong>{{collection_name}}</strong> collection — featuring premium styles and perfect fits.</p>',
ADD COLUMN IF NOT EXISTS collection_description_prompt TEXT DEFAULT 'Write an engaging collection overview inspired by: Explore our exclusively curated collection, featuring premium styles, soft fabrics, and comfortable fits.',
ADD COLUMN IF NOT EXISTS collection_description_limit INTEGER DEFAULT 80;
