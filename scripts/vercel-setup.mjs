#!/usr/bin/env node
/**
 * vercel-setup.mjs — push a store's FULL env var set into its Vercel project.
 * ──────────────────────────────────────────────────────────────────────────
 * Fills the clone gap: reads every key from the active env file and upserts it
 * into the Vercel project (production + preview + development) via the Vercel
 * REST API (reliable, no CLI prompts). Optionally triggers a production deploy.
 *
 * Reads from .env.local (or process.env via --env-file):
 *   VERCEL_TOKEN, VERCEL_PROJECT_NAME, (optional) VERCEL_TEAM_ID
 *   + all the keys to push.
 *
 * Usage:
 *   node scripts/vercel-setup.mjs                 # push env only
 *   node scripts/vercel-setup.mjs --deploy        # push env + trigger prod deploy
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

function loadEnvFile() {
  const out = {};
  try {
    for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch {}
  return out;
}

const env = loadEnvFile();
const TOKEN = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
const PROJECT = env.VERCEL_PROJECT_NAME || process.env.VERCEL_PROJECT_NAME;
const TEAM = env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID || '';
const DEPLOY = process.argv.includes('--deploy');

if (!TOKEN || !PROJECT) {
  console.error('❌ Missing VERCEL_TOKEN or VERCEL_PROJECT_NAME');
  process.exit(1);
}

const vercel = async (path, init = {}) => {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.vercel.com${path}${TEAM ? `${sep}teamId=${TEAM}` : ''}`;
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
};

// Keys we never push to the runtime env (not needed by the app at runtime).
// Everything else present in the env file is pushed (matches existing stores).
const SKIP = new Set(['ADMIN_PASSWORD', 'ADMIN_EMAIL']);

async function main() {
  console.log(`\n▲ vercel-setup.mjs — project "${PROJECT}"${TEAM ? ` (team ${TEAM})` : ''}`);

  // Resolve project id
  const proj = await vercel(`/v9/projects/${PROJECT}`);
  if (!proj.ok) { console.error(`❌ Project "${PROJECT}" not found: ${JSON.stringify(proj.json)}`); process.exit(1); }
  const projectId = proj.json.id;

  const keys = Object.keys(env).filter((k) => !SKIP.has(k) && env[k] !== '');
  let pushed = 0;
  for (const key of keys) {
    const value = env[key];
    // Upsert: Vercel supports ?upsert=true on the env create endpoint.
    const body = {
      key,
      value,
      type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
      target: ['production', 'preview', 'development'],
    };
    const r = await vercel(`/v10/projects/${projectId}/env?upsert=true`, { method: 'POST', body: JSON.stringify(body) });
    if (r.ok) { pushed++; process.stdout.write('.'); }
    else { console.log(`\n   ⚠️  ${key}: ${r.status} ${JSON.stringify(r.json?.error || r.json)}`); }
  }
  console.log(`\n   ✅ pushed/updated ${pushed}/${keys.length} env vars (production+preview+development).`);

  if (DEPLOY) {
    console.log('\n   🚀 triggering production deploy via Vercel CLI...');
    const scope = TEAM ? `--scope ${TEAM}` : '';
    try {
      execSync(`npx vercel deploy --prod --project ${PROJECT} --token ${TOKEN} ${scope} --yes`, { stdio: 'inherit' });
    } catch (e) {
      console.error('   ⚠️  Deploy via CLI failed. You can deploy manually (git push, or `vercel --prod`).');
    }
  }
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
