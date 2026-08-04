import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { error } = await supabase.from('store_settings').update({
    content_provider: 'groq',
    content_model: 'llama-3.1-8b-instant',
    vision_provider: 'groq',
    vision_model: 'llama-3.2-11b-vision-preview'
  }).eq('id', '00000000-0000-4000-8000-000000000001');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Updated AI Settings to Groq (Fastest)');
  }
}

check();
