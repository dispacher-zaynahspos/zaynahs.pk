import fs from 'fs';
import path from 'path';

function getToken(filePath, fallbackKey) {
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
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_mobile INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS related_products_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS related_products_title TEXT DEFAULT 'Related Products',
  ADD COLUMN IF NOT EXISTS related_products_subtitle TEXT DEFAULT 'You might also like these handpicked recommendations',
  ADD COLUMN IF NOT EXISTS related_products_limit INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS related_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS related_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS related_columns_mobile INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS shop_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS shop_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS shop_columns_mobile INTEGER DEFAULT 2;
`;

async function runMigration() {
  console.log('Running SQL Migration across 4 stores using individual tokens...');
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
