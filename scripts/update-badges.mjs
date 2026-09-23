import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const files = [
  '.env.local',
  'env-backups/zaynahs.env.local',
  'env-backups/totvogue.env.local',
  'env-backups/minimahal.env.local',
  'env-backups/littlemister.env.local',
];

const badgesToUpsert = [
  { id: '00000000-0000-4000-8000-000000000002', name: 'Featured', bg_color: '#e94560', text_color: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000004', name: 'HOT', bg_color: '#ea580c', text_color: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Sale', bg_color: '#10b981', text_color: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000005', name: 'New', bg_color: '#d97706', text_color: '#ffffff' },
];

async function updateStore(filePath) {
  if (!fs.existsSync(filePath)) return;
  const env = fs.readFileSync(filePath, 'utf8');
  const get = (k) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
  };

  const supabaseUrl = get('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey = get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.log(`Skipping ${filePath} (missing credentials)`);
    return;
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { error } = await client.from('badges').upsert(badgesToUpsert);
    if (error) {
      console.error(`[${filePath}] Failed to upsert badges:`, error.message);
    } else {
      console.log(`[${filePath}] Successfully updated system badges!`);
    }
  } catch (e) {
    console.error(`[${filePath}] Error:`, e.message);
  }
}

async function main() {
  for (const f of files) {
    await updateStore(f);
  }
  console.log('All stores processed!');
}

main();
