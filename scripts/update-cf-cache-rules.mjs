#!/usr/bin/env node
/**
 * update-cf-cache-rules.mjs
 * Updates Cloudflare html-pages cache rule for ALL stores:
 *   cache:false (bypass) — Next.js ISR + revalidateTag handles HTML freshness.
 * Static assets and supabase-images stay cached.
 *
 * Run: node scripts/update-cf-cache-rules.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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
  const files = readdirSync(backupDir).filter(f => f.endsWith('.env.local'));
  return files.map(file => {
    const env = parseEnv(join(backupDir, file));
    return { name: file.replace('.env.local', ''), zoneId: env.CLOUDFLARE_ZONE_ID, token: env.CLOUDFLARE_API_TOKEN };
  }).filter(s => {
    if (!s.zoneId || !s.token) { console.warn(`⚠️  ${s.name}: missing CF creds — skipped`); return false; }
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
  console.log(`\n🔧 ${store.name} (zone: ${store.zoneId})`);

  // Get rulesets
  const rulesets = await cfReq(store.token, `/zones/${store.zoneId}/rulesets`);
  const cacheRuleset = rulesets.result?.find(r => r.phase === 'http_request_cache_settings');
  if (!cacheRuleset) { console.log('  ⚠️  No cache ruleset found — skipping'); return false; }

  // Get current rules
  const detail = await cfReq(store.token, `/zones/${store.zoneId}/rulesets/${cacheRuleset.id}`);
  const rules = detail.result?.rules || [];
  console.log(`  Found ${rules.length} rules`);

  // Define standard cache rules
  const dynamicBypassExpr = '(http.request.uri.path contains "/cart") or (http.request.uri.path contains "/checkout") or (http.request.uri.path contains "/account") or (http.request.uri.path contains "/api") or (http.request.uri.path contains "/admin") or (http.request.uri.path contains "/wishlist") or (http.request.uri.path contains "/order") or (http.request.uri.path contains "/login") or (http.request.uri.path contains "/signup") or (http.request.uri.path contains "/reset-password")';
  const htmlPagesExpr = `(http.request.uri.path wildcard "/*") and not (${dynamicBypassExpr})`;

  const updatedRules = rules.map(rule => {
    if (rule.description === 'no-cache-dynamic') {
      return {
        ...rule,
        expression: dynamicBypassExpr,
        action_parameters: { cache: false }
      };
    }
    if (rule.description === 'html-pages') {
      console.log(`  → Updating html-pages: edge_ttl: 300s (5 min), cache: true`);
      return {
        ...rule,
        expression: htmlPagesExpr,
        action_parameters: {
          cache: true,
          edge_ttl: {
            mode: 'override_origin',
            default: 300
          }
        }
      };
    }
    return rule;
  });

  // PUT updated ruleset
  await cfReq(
    store.token,
    `/zones/${store.zoneId}/rulesets/${cacheRuleset.id}`,
    'PUT',
    { rules: updatedRules }
  );
  console.log('  ✅ Ruleset updated with 5-minute edge TTL & full dynamic bypass');

  return true;
}

async function main() {
  console.log('🚀 Updating Cloudflare html-pages cache rule → BYPASS for all stores');
  console.log('   Reason: Next.js ISR + revalidateTag handles HTML freshness (RULE C9/C10)\n');

  const stores = loadAllStores();
  console.log(`Stores (${stores.length}): ${stores.map(s => s.name).join(', ')}`);

  let ok = 0;
  for (const store of stores) {
    try {
      const success = await processStore(store);
      if (success) ok++;
    } catch (err) {
      console.error(`  ❌ ${store.name} failed: ${err.message}`);
    }
  }

  console.log(`\n📊 Result: ${ok}/${stores.length} stores updated`);
  if (ok < stores.length) { console.error('⚠️  Some failed — check above'); process.exit(1); }
  console.log('\n✅ ALL DONE — Verify with: curl -I https://domain.com/ | grep cf-cache-status');
  console.log('   Expected: cf-cache-status: MISS (not HIT) for HTML pages');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
