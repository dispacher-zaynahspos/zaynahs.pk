-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_categories ENABLE ROW LEVEL SECURITY;

-- Collections Policies
CREATE POLICY "Enable read access for all users on collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Enable all access for authenticated users on collections"
  ON collections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Collection Categories Policies
CREATE POLICY "Enable read access for all users on collection_categories"
  ON collection_categories FOR SELECT
  USING (true);

CREATE POLICY "Enable all access for authenticated users on collection_categories"
  ON collection_categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
