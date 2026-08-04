import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('store_settings').select('ai_model_credentials, content_provider, vision_provider, content_model, vision_model').limit(1);
  console.log(JSON.stringify(data, null, 2));
}

check();
