-- Drop parent_id from categories
ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_slug ON collections (LOWER(slug));

-- Create collection_categories table
CREATE TABLE IF NOT EXISTS collection_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_categories_collection ON collection_categories (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_categories_category ON collection_categories (category_id);
