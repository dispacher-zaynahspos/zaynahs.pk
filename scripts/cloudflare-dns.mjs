#!/usr/bin/env node
/**
 * cloudflare-dns.mjs — ensure a store's DNS records exist + are proxied.
 * ──────────────────────────────────────────────────────────────────────
 * Creates/updates (idempotent) the two records every Vercel-hosted store needs:
 *   A      @    76.76.21.21            (proxied)   — apex → Vercel
 *   CNAME  www  cname.vercel-dns.com   (proxied)   — www  → Vercel
 *
 * This fills the gap left by deploy-cloudflare-rules.js (which only proxies
 * EXISTING records + sets cache rules). Run this first, then the cache rules.
 *
 * Reads from .env.local (or process.env via --env-file):
 *   CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN, NEXT_PUBLIC_SITE_URL
 *
 * Usage: node --env-file=.env.local scripts/cloudflare-dns.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const out = {};
  try {
    for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
  return out;
}

const env = loadEnv();
const ZONE = process.env.CLOUDFLARE_ZONE_ID || env.CLOUDFLARE_ZONE_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_TOKEN;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');

if (!ZONE || !TOKEN) {
  console.error('❌ Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const cf = async (path, init = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!json.success) throw new Error(`CF ${path}: ${JSON.stringify(json.errors || json)}`);
  return json;
};

const VERCEL_APEX_IP = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

async function main() {
  // Zone name is the apex domain (e.g. lobo.pk)
  const zoneRes = await cf(`/zones/${ZONE}`);
  const apex = zoneRes.result.name;
  console.log(`\n🌐 cloudflare-dns.mjs — zone ${apex} (status: ${zoneRes.result.status})`);
  if (zoneRes.result.status !== 'active') {
    console.log(`   ⚠️  Zone is "${zoneRes.result.status}" — nameservers not switched at the registrar yet.`);
    console.log(`      Set these NS at your domain registrar (PKNIC for .pk): ${zoneRes.result.name_servers?.join(', ')}`);
    console.log('      DNS records will still be created now so the site works the moment NS propagates.');
  }

  const desired = [
    { type: 'A', name: apex, content: VERCEL_APEX_IP, proxied: true },
    { type: 'CNAME', name: `www.${apex}`, content: VERCEL_CNAME, proxied: true },
  ];

  const existing = (await cf(`/zones/${ZONE}/dns_records?per_page=100`)).result;

  for (const rec of desired) {
    const match = existing.find((r) => r.name === rec.name && (r.type === rec.type || (rec.type === 'A' && r.type === 'CNAME') || (rec.type === 'CNAME' && r.type === 'A')));
    const body = { type: rec.type, name: rec.name, content: rec.content, proxied: rec.proxied, ttl: 1 };
    if (match) {
      if (match.content === rec.content && match.proxied === rec.proxied && match.type === rec.type) {
        console.log(`   ✓ ${rec.type} ${rec.name} → ${rec.content} (already correct)`);
        continue;
      }
      await cf(`/zones/${ZONE}/dns_records/${match.id}`, { method: 'PUT', body: JSON.stringify(body) });
      console.log(`   ↻ updated ${rec.type} ${rec.name} → ${rec.content} (proxied)`);
    } else {
      await cf(`/zones/${ZONE}/dns_records`, { method: 'POST', body: JSON.stringify(body) });
      console.log(`   + created ${rec.type} ${rec.name} → ${rec.content} (proxied)`);
    }
  }
  console.log('   ✅ DNS records ensured.');
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
