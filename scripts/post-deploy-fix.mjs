/**
 * post-deploy-fix.mjs
 *
 * Run ONCE after every production deploy on any clone/store setup to prevent
 * stale-cache 500s (Vercel ISR + Cloudflare edge) and verify everything works:
 *
 *   1. Purge Vercel CDN + Data cache (fixes stale ISR renders, e.g. product pages)
 *   2. Purge Cloudflare edge cache (purge_everything)
 *   3. Verify storefront pages return HTTP 200
 *   4. Verify /api/revalidate webhook returns { revalidated: true }
 *
 * Usage: node scripts/post-deploy-fix.mjs
 * Reads VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_NAME, CLOUDFLARE_*,
 * REVALIDATE_SECRET, NEXT_PUBLIC_SITE_URL, SUPABASE_* from .env.local
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, '..', '.env.local');
let env = {};
try {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  }
} catch {}

const siteUrl = (env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
const vercelAlias = env.VERCEL_PROJECT_NAME ? `https://${env.VERCEL_PROJECT_NAME}.vercel.app` : null;
const results = { purgeVercel: null, purgeCloudflare: null, pages: [], webhook: null };

// 1) Purge Vercel cache
const vercelArgs = [
  '--token', env.VERCEL_TOKEN,
  ...(env.VERCEL_TEAM_ID ? ['--scope', env.VERCEL_TEAM_ID] : []),
];
if (env.VERCEL_TOKEN && env.VERCEL_PROJECT_NAME) {
  try {
    const out = spawnSync(
      'npx', ['-y', 'vercel@latest', 'cache', 'purge', '--project', env.VERCEL_PROJECT_NAME, '--yes', ...vercelArgs],
      { timeout: 180000, encoding: 'utf-8' }
    );
    const text = `${out.stdout || ''}${out.stderr || ''}`;
    results.purgeVercel = text.includes('Successfully purged') ? 'OK' : text.trim().slice(-150) || `exit: ${out.status}`;
  } catch (e) {
    results.purgeVercel = `FAILED: ${String(e.message || e).slice(0, 200)}`;
  }
} else {
  results.purgeVercel = 'SKIPPED (VERCEL_TOKEN / VERCEL_PROJECT_NAME missing)';
}
console.log(`[1/4] Vercel cache purge: ${results.purgeVercel}`);

// 2) Purge Cloudflare
if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ purge_everything: true }),
    });
    const data = await res.json();
    results.purgeCloudflare = data.success ? 'OK' : JSON.stringify(data.errors);
  } catch (e) {
    results.purgeCloudflare = `FAILED: ${String(e.message || e)}`;
  }
} else {
  results.purgeCloudflare = 'SKIPPED (CLOUDFLARE creds missing)';
}
console.log(`[2/4] Cloudflare purge: ${results.purgeCloudflare}`);

// 3) Verify pages (homepage + shop + reviews + a sample product if any exist)
const pathsToCheck = ['/', '/shop', '/reviews'];
if (env.SUPABASE_PROJECT_REF && env.SUPABASE_MGMT_TOKEN) {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.SUPABASE_MGMT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT slug FROM public.products WHERE is_active = true AND deleted_at IS NULL LIMIT 1;' }),
    });
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0]?.slug) pathsToCheck.push(`/product/${rows[0].slug}`);
  } catch {}
}
if (!siteUrl) {
  console.log('[3/4] SKIPPED page checks (NEXT_PUBLIC_SITE_URL missing)');
} else {
  for (const path of pathsToCheck) {
    let status = 0;
    let err = '';
    for (const base of [siteUrl, vercelAlias]) {
      if (!base) continue;
      try {
        const res = await fetch(`${base}${path}`, { redirect: 'manual' });
        status = res.status;
        err = '';
        break;
      } catch (e) {
        err = String(e.message || e).slice(0, 120);
      }
    }
    const ok = status >= 200 && status < 400;
    results.pages.push({ path, status, ok });
    console.log(`[3/4] ${status} ${path} ${ok ? 'OK' : `⚠️ FAIL (${err})`}`);
  }
}

// 4) Webhook test
const webhookBase = vercelAlias || siteUrl;
if (webhookBase && env.REVALIDATE_SECRET) {
  try {
    const res = await fetch(`${webhookBase}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.REVALIDATE_SECRET },
      body: JSON.stringify({ type: 'UPDATE', table: 'products', record: { slug: 'test' } }),
    });
    const data = await res.json().catch(() => ({}));
    results.webhook = data.revalidated ? 'OK (revalidated:true)' : `UNEXPECTED: ${res.status} ${JSON.stringify(data).slice(0, 150)}`;
  } catch (e) {
    results.webhook = `FAILED: ${String(e.message || e)}`;
  }
} else {
  results.webhook = 'SKIPPED (site URL / REVALIDATE_SECRET missing)';
}
console.log(`[4/4] Webhook: ${results.webhook}`);

const pagesFailed = results.pages.some((p) => !p.ok);
if (results.purgeVercel === 'OK' && results.purgeCloudflare === 'OK' && !pagesFailed && results.webhook === 'OK (revalidated:true)') {
  console.log('\n✅ ALL CHECKS PASSED — setup is clean.');
  process.exit(0);
} else {
  console.log('\n⚠️ Some checks failed — see messages above.');
  process.exit(pagesFailed || results.webhook !== 'OK (revalidated:true)' ? 1 : 0);
}
