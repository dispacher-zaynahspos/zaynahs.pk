import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
      .from('homepage_sections')
      .insert({
        section_type: 'collections_grid',
        title: 'Nested Collections Grid',
        settings: {},
        content_data: {},
        sort_order: 99,
        active: true,
        vertical_id: null
      })
      .select('*')
      .single();
  console.log(error || data);
}
test();
