import fs from 'fs';
import path from 'path';

function getToken(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/);
    if (match) return match[1].trim();
  }
  return null;
}

const projects = [
  {
    name: 'Zaynahs',
    ref: 'unfdpfmjqljbjydgsccr',
    token: getToken(path.resolve(process.cwd(), '.env.local')) || getToken(path.resolve(process.cwd(), 'env-backups/zaynahs.env.local'))
  },
  {
    name: 'TotVogue',
    ref: 'ziucrfpebpxijqhwmqre',
    token: getToken(path.resolve(process.cwd(), 'env-backups/totvogue.env.local'))
  },
  {
    name: 'MiniMahal',
    ref: 'mgwkcumurrllhpjvfezz',
    token: getToken(path.resolve(process.cwd(), 'env-backups/minimahal.env.local'))
  },
  {
    name: 'LittleMister',
    ref: 'ljknmwianiswkalifueb',
    token: getToken(path.resolve(process.cwd(), 'env-backups/littlemister.env.local'))
  }
];

const sql = `
ALTER TABLE store_settings 
  ADD COLUMN IF NOT EXISTS recently_viewed_title TEXT DEFAULT 'Recently Viewed',
  ADD COLUMN IF NOT EXISTS recently_viewed_subtitle TEXT DEFAULT 'Products you have recently browsed',
  ADD COLUMN IF NOT EXISTS shop_category_chips_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_infinite_scroll BOOLEAN DEFAULT false;
`;

async function runMigration() {
  console.log('Running SQL Migration (v6.3.0) across 4 production stores...');
  for (const project of projects) {
    if (!project.token) {
      console.error(`[SKIP] ${project.name}: No token found.`);
      continue;
    }
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${project.ref}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${project.token}`
        },
        body: JSON.stringify({ query: sql })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`[SUCCESS] ${project.name} (${project.ref}): Status ${res.status}`);
      } else {
        console.error(`[ERROR] ${project.name} (${project.ref}): Status ${res.status}`, data);
      }
    } catch (err) {
      console.error(`[FAIL] ${project.name} (${project.ref}):`, err.message);
    }
  }
}

runMigration();
