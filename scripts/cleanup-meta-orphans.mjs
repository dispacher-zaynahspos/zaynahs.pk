import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse command line args
const args = process.argv.slice(2);
const storeArg = args.find(a => a.startsWith('--store='))?.split('=')[1] || 'totvogue';
const dryRun = args.includes('--dry-run');

const envPath = path.resolve(`env-backups/${storeArg}.env.local`);
if (!fs.existsSync(envPath)) {
  console.error(`Env file not found: ${envPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const catalogId = env.META_CATALOG_ID;
const accessToken = env.META_ACCESS_TOKEN;
const apiVersion = env.META_GRAPH_API_VERSION || 'v21.0';

if (!catalogId || !accessToken) {
  console.error('META_CATALOG_ID or META_ACCESS_TOKEN missing in env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log(`[MetaCleanup] Starting Meta Catalog cleanup for store "${storeArg}" (Catalog ID: ${catalogId})...`);

  // 1. Fetch valid products & variants from DB
  console.log('[MetaCleanup] Fetching active products and variants from Supabase...');
  const { data: dbProducts, error: pErr } = await supabase
    .from('products')
    .select('id, has_variants, is_active, deleted_at')
    .is('deleted_at', null)
    .eq('is_active', true);

  if (pErr) throw pErr;

  const activeProductIds = new Set(dbProducts.map(p => p.id));

  const { data: dbVariants, error: vErr } = await supabase
    .from('product_variants')
    .select('id, product_id, active');

  if (vErr) throw vErr;

  const validRetailerIds = new Set();
  
  // Standalone products (no variants) use product.id as retailer_id
  dbProducts.forEach(p => {
    if (!p.has_variants) {
      validRetailerIds.add(p.id);
    }
  });

  // Variant products use variant.id as retailer_id
  dbVariants.forEach(v => {
    if (activeProductIds.has(v.product_id) && v.active !== false) {
      validRetailerIds.add(v.id);
    }
  });

  console.log(`[MetaCleanup] Active DB valid retailer IDs: ${validRetailerIds.size} (${dbProducts.length} active products)`);

  // 2. Fetch all items currently in Meta Catalog
  console.log('[MetaCleanup] Scanning all items in Meta Catalog to identify orphans...');
  let nextUrl = `https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=250&fields=id,retailer_id,name&access_token=${accessToken}`;
  const allOrphans = [];
  let totalMetaCount = 0;
  let page = 0;

  while (nextUrl) {
    page++;
    process.stdout.write(`\r[MetaCleanup] Scanning page ${page}... (found ${allOrphans.length} orphans so far)`);
    
    let res;
    let attempts = 0;
    while (attempts < 5) {
      try {
        attempts++;
        res = await fetch(nextUrl);
        if (res.status === 429) {
          console.log(`\nRate limit hit during pagination, waiting 15s (attempt ${attempts})...`);
          await sleep(15000);
          continue;
        }
        break;
      } catch (e) {
        console.log(`\nFetch error, retrying in 3s (${e.message})...`);
        await sleep(3000);
      }
    }

    const json = await res.json();
    if (json.error) {
      console.error('\n[MetaCleanup] Meta API Error fetching products:', json.error);
      break;
    }

    const items = json.data || [];
    totalMetaCount += items.length;

    items.forEach(item => {
      if (!validRetailerIds.has(item.retailer_id)) {
        allOrphans.push({
          id: item.id,
          retailer_id: item.retailer_id,
          name: item.name
        });
      }
    });

    nextUrl = json.paging?.next || null;
    await sleep(200);
  }

  console.log(`\n[MetaCleanup] Scan Complete: Total Meta Items = ${totalMetaCount}, Valid = ${totalMetaCount - allOrphans.length}, Orphans = ${allOrphans.length}`);

  if (allOrphans.length === 0) {
    console.log('[MetaCleanup] Catalog is 100% clean and in sync! Zero ghost/orphan items.');
    return;
  }

  if (dryRun) {
    console.log(`[MetaCleanup] DRY RUN: Would delete ${allOrphans.length} orphan items.`);
    return;
  }

  // 3. Batch delete in chunks of 200 with 6s pause between batches (avoids per-minute catalog limit)
  const chunkSize = 200;
  const totalChunks = Math.ceil(allOrphans.length / chunkSize);
  console.log(`[MetaCleanup] Deleting ${allOrphans.length} orphan items in ${totalChunks} batches (200 items/batch, 6s pacing)...`);

  let deletedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < allOrphans.length; i += chunkSize) {
    const chunk = allOrphans.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;

    const requests = chunk.map(item => ({
      method: 'DELETE',
      retailer_id: item.retailer_id,
      data: { id: item.retailer_id }
    }));

    let success = false;
    let attempts = 0;

    while (!success && attempts < 5) {
      attempts++;
      try {
        const batchUrl = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
        const res = await fetch(`${batchUrl}?access_token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_type: 'PRODUCT_ITEM', requests })
        });

        const data = await res.json();

        if (res.status === 429 || (data.error && (data.error.code === 4 || data.error.message?.includes('too many calls')))) {
          console.log(`\n[RateLimit] Meta per-minute limit reached on batch ${chunkIndex}/${totalChunks}. Pausing 30s before retry...`);
          await sleep(30000);
          continue;
        }

        if (data.error) {
          console.error(`\nBatch ${chunkIndex} error:`, data.error.message || data.error);
          failedCount += chunk.length;
          break;
        }

        deletedCount += chunk.length;
        success = true;
        process.stdout.write(`\r[MetaCleanup] Progress: ${deletedCount}/${allOrphans.length} deleted (Batch ${chunkIndex}/${totalChunks})`);
      } catch (err) {
        console.error(`\nBatch ${chunkIndex} network error:`, err.message);
        await sleep(4000);
      }
    }

    // 6-second pacing keeps rate usage at ~10 batch calls per minute (safe threshold)
    await sleep(6000);
  }

  console.log(`\n\n[MetaCleanup] Cleanup Finished!`);
  console.log(` - Successfully deleted: ${deletedCount} orphan items`);
  if (failedCount > 0) {
    console.log(` - Failed: ${failedCount} items`);
  }

  // 4. Final verification
  console.log('[MetaCleanup] Verifying final catalog count...');
  await sleep(4000);
  const verifyRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}?fields=product_count&access_token=${accessToken}`);
  const verifyData = await verifyRes.json();
  console.log(`[MetaCleanup] Final Meta Catalog product count: ${verifyData.product_count} (Expected ~${validRetailerIds.size})`);
}

main().catch(err => {
  console.error('[MetaCleanup] Fatal error:', err);
  process.exit(1);
});
