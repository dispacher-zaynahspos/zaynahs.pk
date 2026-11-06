#!/usr/bin/env node
/**
 * rollback-cf-cache-rules.mjs
 * 1-Command Undo & Rollback engine for Cloudflare Cache Rules across all stores (or single store).
 *
 * Actions:
 *   1. Wipes custom cache rules on Cloudflare (rules: [])
 *   2. Purges entire Cloudflare edge cache (purge_everything: true)
 *   3. Returns store to direct Vercel origin delivery
 *
 * Usage:
 *   node scripts/rollback-cf-cache-rules.mjs               # Rollback all stores
 *   node scripts/rollback-cf-cache-rules.mjs --store=totvogue # Rollback single store
 *   npm run cf:rules:undo
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

async function rollbackStore(store) {
  try {
    // 1. Get ruleset
    const rulesets = await cfReq(store.token, `/zones/${store.zoneId}/rulesets`);
    const cacheRuleset = rulesets.result?.find(r => r.phase === 'http_request_cache_settings');

    if (cacheRuleset) {
      // Empty ruleset to revert to default behavior
      await cfReq(store.token, `/zones/${store.zoneId}/rulesets/${cacheRuleset.id}`, 'PUT', {
        rules: []
      });
    }

    // 2. Purge everything so stale cached HTML is immediately cleared
    await cfReq(store.token, `/zones/${store.zoneId}/purge_cache`, 'POST', {
      purge_everything: true
    });

    return {
      Store: store.name,
      ZoneId: store.zoneId,
      Status: 'ROLLBACK & PURGED 🔄',
      RulesCount: 0
    };
  } catch (err) {
    return {
      Store: store.name,
      ZoneId: store.zoneId || 'N/A',
      Status: `FAILED ❌: ${err.message.slice(0, 50)}`,
      RulesCount: 'N/A'
    };
  }
}

async function main() {
  const stores = loadAllStores();
  console.log(`\n===============================================================`);
  console.log(`🔄 ROLLING BACK CLOUDFLARE CACHE RULES ACROSS ${stores.length} STORES`);
  console.log(`===============================================================\n`);

  const results = await Promise.all(stores.map(rollbackStore));
  console.table(results);
  console.log(`\n✅ Rollback complete. Cloudflare cache bypassed and purged across selected stores.\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
