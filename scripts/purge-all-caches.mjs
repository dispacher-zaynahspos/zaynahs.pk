import fs from 'fs';
import path from 'path';

/**
 * Fast & Safe Cache Purge Across All Stores (RULE CRED-ENVBACKUP & RULE C10)
 * By default: Targeted edge URL purge + Next.js ISR revalidation.
 * Full zone wipe (purge_everything) requires --dangerously-purge-everything flag.
 *
 * Usage:
 *   node scripts/purge-all-caches.mjs                # Safe targeted purge on all stores
 *   node scripts/purge-all-caches.mjs --store=lobo   # Safe targeted purge on single store
 *   node scripts/purge-all-caches.mjs --dangerously-purge-everything # Requires explicit intent
 */

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

const isFullPurge = process.argv.includes('--dangerously-purge-everything');
const specificStore = process.argv.find(a => a.startsWith('--store='))?.split('=')[1];

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
  const storeName = file.replace('.env.local', '');
  const envPath = path.join(envBackupsDir, file);
  const env = parseEnv(envPath);

  const rawSite = env.NEXT_PUBLIC_SITE_URL || '';
  const site = rawSite.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');
  const cfZone = env.CLOUDFLARE_ZONE_ID;
  const cfToken = env.CLOUDFLARE_API_TOKEN;
  const revalidateSecret = env.REVALIDATE_SECRET || 'zaynahs_secret_cache_revalidate_2026';

  let cfStatus = 'SKIPPED (no creds)';
  let isrStatus = 'SKIPPED (no site)';
  let r2Status = isFullPurge ? 'SKIPPED (no creds)' : 'PRESERVED (targeted)';

  // 1. Wipe R2 Incremental Cache (RULE C19 - Dual-Layer Purge)
  const accountId = env.CF_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = env.NEXT_INC_CACHE_R2_BUCKET || `${storeName}-next-cache`;

  if (isFullPurge && accountId && accessKeyId && secretAccessKey) {
    try {
      const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey }
      });

      let totalDeleted = 0;
      let hasMore = true;
      while (hasMore) {
        const listRes = await s3.send(new ListObjectsV2Command({
          Bucket: r2Bucket,
          MaxKeys: 1000
        }));
        const contents = listRes.Contents || [];
        if (contents.length === 0) break;
        await s3.send(new DeleteObjectsCommand({
          Bucket: r2Bucket,
          Delete: { Objects: contents.map(c => ({ Key: c.Key })), Quiet: true }
        }));
        totalDeleted += contents.length;
        hasMore = Boolean(listRes.IsTruncated);
      }
      r2Status = totalDeleted > 0 ? `WIPED ${totalDeleted} OBJS ✅` : 'CLEAN (0 objs) ✅';
    } catch (e) {
      r2Status = `R2 ERR: ${e.message.slice(0, 30)}`;
    }
  }

  // 2. Cloudflare Purge
  if (cfZone && cfToken) {
    try {
      const body = isFullPurge
        ? { purge_everything: true }
        : {
            files: [
              `${site}/`,
              `${site}/shop`,
              `${site.replace('://', '://www.')}/`,
              `${site.replace('://', '://www.')}/shop`,
            ]
          };

      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        cfStatus = isFullPurge ? 'FULL PURGE ✅' : 'TARGETED PURGE ✅';
      } else {
        cfStatus = `CF ERR: ${JSON.stringify(data.errors || data.messages).slice(0, 40)}`;
      }
    } catch (e) {
      cfStatus = `CF ERR: ${e.message.slice(0, 40)}`;
    }
  }

  // 3. Next.js Revalidate Webhook
  if (site && site.startsWith('http')) {
    try {
      const res = await fetch(`${site}/api/revalidate`, {
        method: 'POST',
        headers: {
          'x-revalidate-secret': revalidateSecret,
          'Authorization': `Bearer ${revalidateSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table: 'deploy', type: 'deploy' })
      });
      isrStatus = res.ok ? `ISR REVALIDATED ✅ (${res.status})` : `ISR HTTP ${res.status}`;
    } catch (e) {
      isrStatus = `ISR ERR: ${e.message.slice(0, 40)}`;
    }
  }

  return {
    Store: storeName,
    Domain: site || 'N/A',
    'R2 Cache': r2Status,
    Cloudflare: cfStatus,
    'Next.js ISR': isrStatus
  };
}

async function main() {
  const targetFiles = specificStore
    ? envFiles.filter(f => f.replace('.env.local', '') === specificStore)
    : envFiles;

  if (targetFiles.length === 0) {
    console.error(`❌ No matching store found in env-backups/ for: ${specificStore || 'any'}`);
    process.exit(1);
  }

  console.log(`\n===============================================================`);
  console.log(`🚀 ${isFullPurge ? '⚠️ DANGEROUS FULL' : '🛡️ TARGETED'} CACHE PURGE ACROSS ${targetFiles.length} STORE(S)`);
  console.log(`===============================================================\n`);

  const results = await Promise.all(targetFiles.map(purgeStore));

  console.table(results);
}

main().catch(console.error);
