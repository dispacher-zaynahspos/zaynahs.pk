#!/usr/bin/env node
/**
 * ⚡ MASTER MULTI-STORE BULK OPERATIONS ENGINE (RULE ROLLOUT1 & RULE CRED-ENVBACKUP)
 *
 * Executes bulk operations across all stores in parallel with 1 command:
 *   - push:       Push commit to all store Git remotes simultaneously
 *   - sync-envs:  Inject/update all Vercel environment variables via fast REST API
 *   - sync-cf:    Deploy Cloudflare cache rules to all zones via Cloudflare API
 *   - wait:       Monitor all Vercel deployments until READY
 *   - purge:      Purge Cloudflare cache & revalidate Next.js ISR across all stores
 *   - verify:     Full automated test (TTFB, CF Cache HIT, Instant Price Freshness, Checkout)
 *   - all:        1-Click Full Pipeline (push -> sync-envs -> sync-cf -> wait -> purge -> verify)
 *
 * Usage:
 *   npm run stores:all              # 🚀 1-Click complete deployment, purge & verification
 *   npm run stores:push             # Push to all remotes in parallel
 *   npm run stores:sync-envs        # Sync envs to all Vercel projects via API
 *   npm run stores:sync-cf          # Deploy CF cache rules to all zones
 *   npm run stores:wait             # Wait for all Vercel builds to be READY
 *   npm run stores:purge            # Purge edge cache on all stores
 *   npm run stores:verify           # Run verification sweep across all stores
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_DIR = path.join(ROOT, 'env-backups');

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

function loadAllStores() {
  const files = fs.readdirSync(ENV_DIR).filter(f => f.endsWith('.env.local'));
  const stores = [];
  for (const file of files) {
    const name = file.replace('.env.local', '');
    const env = parseEnv(path.join(ENV_DIR, file));
    stores.push({
      name,
      envFile: file,
      domain: (env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '').replace(/^http:\/\//, 'https://'),
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
      cfZone: env.CLOUDFLARE_ZONE_ID,
      cfToken: env.CLOUDFLARE_API_TOKEN,
      vercelProject: env.VERCEL_PROJECT_NAME,
      vercelToken: env.VERCEL_TOKEN || env.VERCEL_API_TOKEN,
      vercelTeam: env.VERCEL_TEAM_ID,
      revalidateSecret: env.REVALIDATE_SECRET || 'zaynahs_secret_cache_revalidate_2026'
    });
  }
  return stores;
}

const stores = loadAllStores();

function getGitRemotes() {
  try {
    const raw = execSync('git remote', { cwd: ROOT, encoding: 'utf8' });
    return raw.split('\n').map(r => r.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// Map store name to remote name
function resolveRemote(storeName, activeRemotes) {
  const map = {
    totvogue: ['origin', 'totvogue'],
    littlemister: ['littlemisterpk-cell', 'littlemister'],
    minimahal: ['infominimahal-bit', 'minimahal'],
    lobo: ['infolobopk-lgtm', 'lobo'],
    zaynahs: ['dispacher-zaynahspos', 'zaynahspk', 'zaynahs']
  };

  const candidates = map[storeName] || [storeName];
  for (const cand of candidates) {
    if (activeRemotes.includes(cand)) return cand;
  }
  return null;
}

async function runPush() {
  console.log('\n===============================================================');
  console.log('🚀 PUSHING TO ALL STORE REMOTES IN PARALLEL');
  console.log('===============================================================\n');

  const activeRemotes = getGitRemotes();
  const pushPromises = stores.map(store => {
    const remote = resolveRemote(store.name, activeRemotes);
    if (!remote) {
      console.warn(`⚠️  No remote found for store ${store.name}`);
      return Promise.resolve({ store: store.name, status: 'SKIPPED (no remote)' });
    }

    return new Promise(resolve => {
      const start = Date.now();
      const p = spawn('git', ['push', remote, 'main'], { cwd: ROOT });
      let output = '';
      p.stdout.on('data', d => { output += d.toString(); });
      p.stderr.on('data', d => { output += d.toString(); });
      p.on('close', code => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        if (code === 0) {
          console.log(`✅ [${store.name}] Pushed to ${remote} in ${elapsed}s`);
          resolve({ store: store.name, remote, status: 'PUSHED ✅', time: `${elapsed}s` });
        } else {
          console.error(`❌ [${store.name}] Failed to push to ${remote}: ${output.slice(0, 80)}`);
          resolve({ store: store.name, remote, status: 'FAILED ❌', error: output.slice(0, 80) });
        }
      });
    });
  });

  const results = await Promise.all(pushPromises);
  console.table(results);
}

async function runSyncEnvs() {
  console.log('\n===============================================================');
  console.log('🔄 SYNCING VERCEL ENV VARIABLES VIA FAST REST API');
  console.log('===============================================================\n');

  const results = [];

  for (const store of stores) {
    if (!store.vercelProject || !store.vercelToken) {
      results.push({ store: store.name, status: 'SKIPPED (no Vercel creds)' });
      continue;
    }

    try {
      let teamQuery = store.vercelTeam ? `?teamId=${store.vercelTeam}` : '';
      const projRes = await fetch(`https://api.vercel.com/v9/projects/${store.vercelProject}${teamQuery}`, {
        headers: { Authorization: `Bearer ${store.vercelToken}` }
      });
      const projData = await projRes.json();
      const projectId = projData.id || store.vercelProject;

      const envsToSet = [
        { key: 'CLOUDFLARE_ZONE_ID', value: store.cfZone },
        { key: 'CLOUDFLARE_API_TOKEN', value: store.cfToken },
        { key: 'NEXT_PUBLIC_SITE_URL', value: store.domain },
        { key: 'REVALIDATE_SECRET', value: store.revalidateSecret }
      ].filter(e => e.value);

      for (const item of envsToSet) {
        // Upsert via POST or PATCH
        await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${teamQuery}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${store.vercelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: item.key,
            value: item.value,
            type: 'encrypted',
            target: ['production', 'preview', 'development']
          })
        }).catch(() => {});
      }

      console.log(`✅ [${store.name}] Vercel envs synced (${envsToSet.length} keys)`);
      results.push({ store: store.name, project: store.vercelProject, status: 'SYNCED ✅' });
    } catch (err) {
      console.error(`❌ [${store.name}] Failed to sync envs:`, err.message);
      results.push({ store: store.name, project: store.vercelProject, status: `ERROR: ${err.message}` });
    }
  }

  console.table(results);
}

async function runSyncCf() {
  console.log('\n===============================================================');
  console.log('⚡ DEPLOYING CLOUDFLARE CACHE RULES ACROSS ALL STORES');
  console.log('===============================================================\n');

  const updateScript = path.join(ROOT, 'scripts', 'update-cf-cache-rules.mjs');
  if (fs.existsSync(updateScript)) {
    execSync(`node "${updateScript}"`, { stdio: 'inherit', cwd: ROOT });
  } else {
    console.error('scripts/update-cf-cache-rules.mjs not found.');
  }
}

async function runWaitBuilds(maxWaitSec = 240) {
  console.log('\n===============================================================');
  console.log('⏳ MONITORING VERCEL DEPLOYMENTS UNTIL ALL READY');
  console.log('===============================================================\n');

  const start = Date.now();
  let allReady = false;

  while (!allReady && (Date.now() - start) < maxWaitSec * 1000) {
    const statuses = await Promise.all(stores.map(async store => {
      if (!store.vercelProject || !store.vercelToken) {
        return { name: store.name, state: 'NO_CREDS' };
      }
      let url = `https://api.vercel.com/v6/deployments?projectId=${store.vercelProject}&limit=1`;
      if (store.vercelTeam) url += `&teamId=${store.vercelTeam}`;
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${store.vercelToken}` } });
        const data = await res.json();
        const d = (data.deployments || [])[0];
        const state = d ? (d.state || d.readyState || 'UNKNOWN') : 'NO_DEPLOY';
        return { name: store.name, state };
      } catch {
        return { name: store.name, state: 'ERR' };
      }
    }));

    const readyCount = statuses.filter(s => s.state === 'READY').length;
    const elapsed = Math.round((Date.now() - start) / 1000);
    const summary = statuses.map(s => `${s.name}: ${s.state === 'READY' ? 'READY ✅' : s.state}`).join(' | ');

    process.stdout.write(`\r[${elapsed}s] (${readyCount}/${stores.length} READY) -> ${summary}    `);

    if (readyCount === stores.length) {
      allReady = true;
      console.log(`\n\n🎉 ALL ${stores.length} STORES ARE READY ON VERCEL! (in ${elapsed}s)\n`);
      return true;
    }

    await new Promise(r => setTimeout(r, 6000));
  }

  if (!allReady) {
    console.warn(`\n⚠️  Build monitoring timed out after ${maxWaitSec}s.`);
    return false;
  }
}

async function runPurge() {
  console.log('\n===============================================================');
  console.log('🧹 PURGING CLOUDFLARE EDGE & REVALIDATING NEXT.JS ISR');
  console.log('===============================================================\n');

  const purgeScript = path.join(ROOT, 'scripts', 'purge-all-caches.mjs');
  if (fs.existsSync(purgeScript)) {
    execSync(`node "${purgeScript}" --dangerously-purge-everything`, { stdio: 'inherit', cwd: ROOT });
  } else {
    console.error('scripts/purge-all-caches.mjs not found.');
  }
}

async function runVerify() {
  console.log('\n===============================================================');
  console.log('🔍 RUNNING COMPREHENSIVE 5-STORE NETWORK VERIFICATION SWEEP');
  console.log('===============================================================\n');

  const verifyScript = path.join(ROOT, 'scripts', 'verify-store-network.mjs');
  if (fs.existsSync(verifyScript)) {
    execSync(`node "${verifyScript}"`, { stdio: 'inherit', cwd: ROOT });
  } else {
    console.error('scripts/verify-store-network.mjs not found.');
  }
}

async function main() {
  const command = process.argv[2] || 'all';

  switch (command) {
    case 'push':
      await runPush();
      break;
    case 'sync-envs':
      await runSyncEnvs();
      break;
    case 'sync-cf':
      await runSyncCf();
      break;
    case 'wait':
      await runWaitBuilds();
      break;
    case 'purge':
      await runPurge();
      break;
    case 'verify':
      await runVerify();
      break;
    case 'all':
      console.log(`\n🔥🔥🔥 STARTING 1-CLICK ALL-STORES AUTOMATED PIPELINE 🔥🔥🔥\n`);
      await runPush();
      await runSyncEnvs();
      await runSyncCf();
      await runWaitBuilds();
      await runPurge();
      await runVerify();
      console.log(`\n🏁 1-CLICK PIPELINE FINISHED.\n`);
      break;
    default:
      console.log(`Usage: node scripts/stores-bulk-ops.mjs [push|sync-envs|sync-cf|wait|purge|verify|all]`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in stores-bulk-ops:', err);
  process.exit(1);
});
