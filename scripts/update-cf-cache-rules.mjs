#!/usr/bin/env node
/**
 * update-cf-cache-rules.mjs
 * Fast & Parallel Cloudflare Cache Rules Deployer across all stores (RULE CRED-ENVBACKUP).
 * Deploys 4 standard cache rules:
 *   1. no-cache-dynamic: cache bypass for dynamic/user routes (/cart, /checkout, /account, /api, /admin, etc.)
 *   2. static-assets: Next.js static files cached 1 year
 *   3. html-pages: edge TTL 30 days — freshness comes from purge-on-write
 *      (admin save → purge_everything). Do NOT shorten: that multiplies
 *      Vercel origin hits/bandwidth.
 *   4. supabase-images: cached 30 days
 *
 * Usage:
 *   node scripts/update-cf-cache-rules.mjs               # Deploy to all stores in env-backups/
 *   node scripts/update-cf-cache-rules.mjs --store=lobo  # Deploy to single store
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// RULE SSOT1: cache rules are defined once in scripts/lib/cf-cache-rules.js
const require = createRequire(import.meta.url);
const { buildCacheRules } = require('./lib/cf-cache-rules.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const specificStore = process.argv.find(a => a.startsWith('--store='))?.split('=')[1];

function parseEnv(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function loadAllStores() {
  const backupDir = join(ROOT, 'env-backups');
  let files = readdirSync(backupDir).filter(f => f.endsWith('.env.local'));
  if (specificStore) {
    files = files.filter(f => f.replace('.env.local', '') === specificStore);
  }
  return files.map(file => {
    const env = parseEnv(join(backupDir, file));
    return {
      name: file.replace('.env.local', ''),
      zoneId: env.CLOUDFLARE_ZONE_ID,
      token: env.CLOUDFLARE_API_TOKEN,
      domain: env.NEXT_PUBLIC_SITE_URL || ''
    };
  }).filter(s => {
    if (!s.zoneId || !s.token) {
      console.warn(`⚠️  ${s.name}: missing CF creds — skipped`);
      return false;
    }
    return true;
  });
}

async function cfReq(token, path, method = 'GET', body = null) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(JSON.stringify(data.errors || data));
  return data;
}

async function processStore(store) {
  try {
    // 1. Get rulesets
    const rulesets = await cfReq(store.token, `/zones/${store.zoneId}/rulesets`);
    let cacheRuleset = rulesets.result?.find(r => r.phase === 'http_request_cache_settings');

    // RULE SSOT1: rule list comes from scripts/lib/cf-cache-rules.js
    const standardRules = buildCacheRules();

    if (!cacheRuleset) {
      // Create ruleset if missing
      await cfReq(store.token, `/zones/${store.zoneId}/rulesets`, 'POST', {
        name: 'default',
        kind: 'zone',
        phase: 'http_request_cache_settings',
        rules: standardRules
      });
    } else {
      // Update ruleset
      await cfReq(store.token, `/zones/${store.zoneId}/rulesets/${cacheRuleset.id}`, 'PUT', {
        rules: standardRules
      });
    }

    // Set zone browser_cache_ttl to 0 (Respect origin) to stop clients caching HTML on device disk
    try {
      await cfReq(store.token, `/zones/${store.zoneId}/settings/browser_cache_ttl`, 'PATCH', { value: 0 });
    } catch (e) {
      console.warn(`[${store.name}] browser_cache_ttl setting warning:`, e.message);
    }

    return {
      Store: store.name,
      ZoneId: store.zoneId,
      Status: 'DEPLOYED ✅',
      RulesCount: standardRules.length
    };
  } catch (err) {
    return {
      Store: store.name,
      ZoneId: store.zoneId || 'N/A',
      Status: `FAILED ❌: ${err.message.slice(0, 50)}`,
      RulesCount: 0
    };
  }
}

async function main() {
  const stores = loadAllStores();
  console.log(`\n===============================================================`);
  console.log(`🚀 DEPLOYING CLOUDFLARE CACHE RULES ACROSS ${stores.length} STORES (PARALLEL)`);
  console.log(`===============================================================\n`);

  const results = await Promise.all(stores.map(processStore));
  console.table(results);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
