import fs from 'fs';
import path from 'path';

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local') || f.endsWith('.env'));

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function purgeStore(file) {
  const envPath = path.join(envBackupsDir, file);
  const env = parseEnv(envPath);

  const site = env.NEXT_PUBLIC_SITE_URL || file;
  const cfZone = env.CLOUDFLARE_ZONE_ID;
  const cfToken = env.CLOUDFLARE_API_TOKEN;
  const revalidateSecret = env.REVALIDATE_SECRET || 'zaynahs_secret_cache_revalidate_2026';

  console.log(`\n===============================================================`);
  console.log(`🧹 Purging Cache for: ${file} (${site})`);
  console.log(`===============================================================`);

  // 1. Cloudflare Edge Purge
  if (cfZone && cfToken) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ purge_everything: true })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  ✅ Cloudflare Cache Purged: OK (Zone: ${cfZone})`);
      } else {
        console.warn(`  ⚠️ Cloudflare Purge response:`, data.errors || data.messages);
      }
    } catch (e) {
      console.error(`  ❌ Cloudflare Purge error:`, e.message);
    }
  } else {
    console.log(`  ⏭️ Cloudflare Purge skipped (No Zone/Token in ${file})`);
  }

  // 2. Next.js Revalidate Webhook
  if (site && site.startsWith('http')) {
    try {
      const res = await fetch(`${site}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${revalidateSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paths: ['/', '/shop', '/reviews'] })
      });
      if (res.ok) {
        console.log(`  ✅ Next.js On-Demand ISR Revalidated: OK (${res.status})`);
      } else {
        console.log(`  ℹ️ Next.js Revalidate response: HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`  ℹ️ Revalidate webhook notice: ${e.message}`);
    }
  }
}

async function main() {
  console.log(`🚀 Starting Full Cache Purge Across All Stores (${envFiles.length} stores)...`);
  for (const f of envFiles) {
    await purgeStore(f);
  }
  console.log(`\n🎉 All stores cache purge complete!`);
}

main().catch(console.error);
