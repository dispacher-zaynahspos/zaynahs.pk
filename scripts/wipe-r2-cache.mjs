import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  }
  return env;
}

async function wipeBucket(bucketName, env) {
  const accountId = env.CF_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials in environment.');
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });

  console.log(`🧹 Starting full wipe of R2 bucket "${bucketName}"...`);
  let totalDeleted = 0;
  let hasMore = true;
  let batchNum = 0;

  while (hasMore) {
    batchNum++;
    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000
    }));

    const contents = listRes.Contents || [];
    if (contents.length === 0) {
      break;
    }

    const objectsToDelete = contents.map(c => ({ Key: c.Key }));
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: objectsToDelete, Quiet: true }
    }));

    totalDeleted += objectsToDelete.length;
    console.log(`[Batch ${batchNum}] Deleted ${objectsToDelete.length} objects (Total: ${totalDeleted})`);
    hasMore = Boolean(listRes.IsTruncated);
  }

  console.log(`✅ COMPLETE! Total deleted from ${bucketName}: ${totalDeleted} objects.`);
  return totalDeleted;
}

async function main() {
  const store = process.argv.find(a => a.startsWith('--store='))?.split('=')[1] || 'totvogue';
  const envPath = path.resolve(`env-backups/${store}.env.local`);
  const env = loadEnv(envPath);

  const bucketName = env.NEXT_INC_CACHE_R2_BUCKET || `${store}-next-cache`;
  await wipeBucket(bucketName, env);

  // Also purge Cloudflare CDN edge cache
  if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
    console.log(`🌐 Purging Cloudflare CDN Edge Cache for zone ${env.CLOUDFLARE_ZONE_ID}...`);
    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ purge_everything: true })
    });
    const cfData = await cfRes.json();
    console.log('Cloudflare CDN Purge result:', cfData.success ? 'SUCCESS ✅' : cfData);
  }
}

main().catch(err => {
  console.error('❌ Error wiping R2 cache:', err);
  process.exit(1);
});
