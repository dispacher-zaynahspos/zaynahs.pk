import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupDir = resolve(__dirname, '..', 'env-backups');

const multiStoreConfig = [];
const projects = [];

try {
  const files = readdirSync(backupDir).filter(f => f.endsWith('.env.local') || f.endsWith('.env'));
  for (const file of files) {
    const bEnv = {};
    const bContent = readFileSync(resolve(backupDir, file), 'utf-8');
    for (const line of bContent.split('\n')) {
      const t = line.trim();
      if (t && !t.startsWith('#')) {
        const eq = t.indexOf('=');
        if (eq > 0) bEnv[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
      }
    }
    
    if (bEnv.VERCEL_PROJECT_NAME && bEnv.VERCEL_TOKEN) {
      projects.push({
        name: bEnv.VERCEL_PROJECT_NAME,
        token: bEnv.VERCEL_TOKEN,
        cfZone: bEnv.CLOUDFLARE_ZONE_ID,
        cfToken: bEnv.CLOUDFLARE_API_TOKEN
      });
    }

    if (bEnv.CLOUDFLARE_ZONE_ID && bEnv.CLOUDFLARE_API_TOKEN) {
      if (!multiStoreConfig.find(c => c.zoneId === bEnv.CLOUDFLARE_ZONE_ID)) {
        multiStoreConfig.push({
          name: bEnv.NEXT_PUBLIC_BRAND_NAME || file,
          zoneId: bEnv.CLOUDFLARE_ZONE_ID,
          apiToken: bEnv.CLOUDFLARE_API_TOKEN
        });
      }
    }
  }
} catch (e) {
  console.error("Error reading env-backups:", e);
  process.exit(1);
}

const configString = JSON.stringify(multiStoreConfig);

console.log(`Found ${projects.length} Vercel projects to update.`);
console.log(`Multi-Store Config has ${multiStoreConfig.length} zones.`);

for (const p of projects) {
  console.log(`\nPushing to Vercel Project: ${p.name}`);
  
  const addEnv = (key, value) => {
    console.log(`  Updating ${key}...`);
    // Delete first in case it exists, ignore errors
    spawnSync('npx', ['-y', 'vercel@latest', 'env', 'rm', key, 'production', 'preview', 'development', '--project', p.name, '--token', p.token, '--yes'], { encoding: 'utf-8' });
    
    for (const envName of ['production', 'preview', 'development']) {
      const out = spawnSync('npx', ['-y', 'vercel@latest', 'env', 'add', key, envName, '--project', p.name, '--token', p.token], {
        input: value,
        encoding: 'utf-8'
      });
      
      if (out.status !== 0) {
        console.error(`    Failed to add ${key} to ${envName}: ${out.stderr || out.stdout}`);
      } else {
        console.log(`    Success for ${envName}.`);
      }
    }
  };

  addEnv('MULTI_STORE_CLOUDFLARE_CONFIG', configString);
  
  if (p.cfZone && p.cfToken) {
    addEnv('CLOUDFLARE_ZONE_ID', p.cfZone);
    addEnv('CLOUDFLARE_API_TOKEN', p.cfToken);
  }
}

console.log('\n✅ All Vercel environments synced successfully.');
