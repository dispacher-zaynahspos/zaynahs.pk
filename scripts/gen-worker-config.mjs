#!/usr/bin/env node
/**
 * gen-worker-config.mjs — generate per-store Wrangler configs.
 *
 * UNIVERSAL BY DESIGN: no domain, brand, worker name, bucket name or host is
 * hardcoded here. Everything is derived from the store env file.
 *
 *   node scripts/gen-worker-config.mjs --store=zaynahs
 *   node scripts/gen-worker-config.mjs --env=.env.local
 *   node scripts/gen-worker-config.mjs --store=zaynahs --print
 *
 * Output (git-ignored): worker-config/<slug>/wrangler.store.jsonc
 *                       worker-config/<slug>/wrangler.admin.jsonc
 *
 * Secrets are NEVER written. Only names/routes/bindings go into the config.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const [k, v] = raw.replace(/^--/, '').split('=');
    args[k] = v === undefined ? true : v;
  }
  return args;
}

function loadEnvFile(filePath) {
  iبببbzb f(!existsSync(filePath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function requireEnv(env, key) {
  const value = (env[key] || '').trim();
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
}

/** Cloudflare rejects future compatibility dates — use yesterday (UTC). */
function compatDate() {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function buildConfigs(ctx, split) {
  const {
    slug,
    siteUrl,
    siteHost,
    adminHost,
    imgHost,
    cacheBucket,
    imageBucket,
    date,
  } = ctx;

  const base = {
    main: '.open-next/worker.js',
    compatibility_date: date,
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
    observability: { enabled: true },
    r2_buckets: [
      { binding: 'NEXT_INC_CACHE_R2_BUCKET', bucket_name: cacheBucket },
      { binding: 'R2_IMAGES_BUCKET', bucket_name: imageBucket },
    ],
    durable_objects: {
      bindings: [
        { name: 'NEXT_CACHE_DO_QUEUE', class_name: 'DOQueueHandler' },
        { name: 'NEXT_TAG_CACHE_DO_QUEUE', class_name: 'DOQueueHandler' },
      ],
    },
    migrations: [{ tag: 'v1', new_sqlite_classes: ['DOQueueHandler'] }],
    workers_dev: true,
  };

  const vars = {
    WORKER_ROLE: 'all',
    NEXT_PUBLIC_SITE_URL: siteUrl.replace(/\/+$/, ''),
    ADMIN_HOST: adminHost,
    IMG_HOST: imgHost,
  };

  const single = {
    $schema: 'node_modules/wrangler/config-schema.json',
    name: slug,
    ...base,
    vars,
    routes: [
      { pattern: siteHost, custom_domain: true },
      { pattern: `www.${siteHost}`, custom_domain: true },
      { pattern: adminHost, custom_domain: true },
    ],
  };

  if (!split) return { single };

  const store = {
    $schema: single.$schema,
    name: `${slug}-store`,
    ...base,
    vars: { ...vars, WORKER_ROLE: 'store' },
    routes: [
      { pattern: siteHost, custom_domain: true },
      { pattern: `www.${siteHost}`, custom_domain: true },
    ],
  };

  const admin = {
    $schema: single.$schema,
    name: `${slug}-admin`,
    ...base,
    vars: { ...vars, WORKER_ROLE: 'admin' },
    routes: [{ pattern: adminHost, custom_domain: true }],
  };

  return { store, admin };
}

function writeConfigs(outDir, configs, printOnly) {
  const header =
    '// GENERATED FILE — do not edit.\n' +
    '// Regenerate: npm run worker:config -- --store=<store>\n';

  const files = Object.entries(configs).map(([key, cfg]) => [
    join(outDir, key === 'single' ? 'wrangler.jsonc' : `wrangler.${key}.jsonc`),
    cfg,
  ]);

  if (!printOnly) mkdirSync(outDir, { recursive: true });
  for (const [path, cfg] of files) {
    const body = header + JSON.stringify(cfg, null, 2) + '\n';
    if (printOnly) {
      console.log(`\n--- ${path} ---\n${body}`);
    } else {
      writeFileSync(path, body, 'utf8');
    }
  }
  return files;
}

function main() {
  const args = parseArgs(process.argv);
  const storeArg = typeof args.store === 'string' ? args.store : '';
  const envArg = typeof args.env === 'string' ? args.env : '';

  const envPath = envArg
    ? resolve(ROOT, envArg)
    : join(ROOT, 'env-backups', `${storeArg}.env.local`);
  if (!envArg && !storeArg) {
    throw new Error('Pass --store=<name> (reads env-backups/<name>.env.local) or --env=<path>');
  }

  const env = loadEnvFile(envPath);
  const siteUrl = requireEnv(env, 'NEXT_PUBLIC_SITE_URL');
  const parsed = new URL(siteUrl);
  const siteHost = parsed.host.replace(/^www\./, '');
  const slug = storeArg ? slugify(storeArg) : slugify(siteHost);

  const ctx = {
    slug,
    siteUrl,
    siteHost,
    adminHost: (env.ADMIN_HOST || `admin.${siteHost}`).trim(),
    imgHost: (env.IMG_HOST || `img.${siteHost}`).trim(),
    cacheBucket: (env.NEXT_INC_CACHE_R2_BUCKET || `${slug}-next-cache`).trim(),
    imageBucket: (env.R2_IMAGES_BUCKET || `${slug}-images`).trim(),
    date: compatDate(),
  };

  const configs = buildConfigs(ctx, Boolean(args.split));
  const outDir = join(ROOT, 'worker-config', slug);
  const files = writeConfigs(outDir, configs, Boolean(args.print));

  console.log(`\n✔ worker(s): ${Object.values(configs).map((c) => c.name).join(', ')}`);
  console.log(`  site   : ${ctx.siteHost}`);
  console.log(`  admin  : ${ctx.adminHost}`);
  console.log(`  images : ${ctx.imgHost}`);
  console.log(`  buckets: ${ctx.cacheBucket}, ${ctx.imageBucket}`);
  if (!args.print) {
    for (const [filePath] of files) console.log(`  wrote ${filePath}`);
  }

  console.log(
    '\nSecrets to set per Worker (names only, never in vars):\n' +
    '  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,\n' +
    '  SUPABASE_SERVICE_ROLE_KEY, REVALIDATE_SECRET, CRON_SECRET,\n' +
    '  NEXT_PUBLIC_ADMIN_EMAIL, NEXT_PUBLIC_BRAND_NAME,\n' +
    '  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CLOUDFLARE_API_TOKEN\n'
  );
}

try {
  main();
} catch (error) {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
