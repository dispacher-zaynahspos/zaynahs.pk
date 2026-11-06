#!/usr/bin/env node
/**
 * snapshot.mjs — capture / compare rendered HTML safety net.
 *
 *   node scripts/snapshot.mjs --base=http://localhost:3000 --out=scratch/snapshots/batch1
 *   node scripts/snapshot.mjs --base=http://localhost:3000 --compare=scratch/snapshots/batch1
 *
 * Captures for each route: status, key headers, <title>, meta description,
 * canonical, and a content hash (normalised whitespace).
 *
 * --compare exits non-zero when any hash/title/meta differs, and prints the diff.
 * No dependencies. No writes outside --out.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import http from 'node:http';
import https from 'node:https';

const DEFAULT_ROUTES = [
  '/',
  '/shop',
  '/product',
  '/cart',
  '/checkout',
  '/login',
  '/signup',
  '/wishlist',
  '/reviews',
  '/contact',
  '/admin/login',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
];

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const [k, v] = raw.replace(/^--/, '').split('=');
    args[k] = v === undefined ? true : v;
  }
  return args;
}

function fetchPage(base, path, host, timeoutMs = 30000) {
  const url = new URL(path, base);
  const lib = url.protocol === 'https:' ? https : http;
  return new Promise((resolve) => {
    const req = lib.request(
      url,
      {
        method: 'GET',
        headers: {
          ...(host ? { Host: host } : {}),
          'User-Agent': 'snapshot/1.0',
        },
        timeout: timeoutMs,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const text = normalizeForHash(body);
          resolve({
            status: res.statusCode || 0,
            headers: {
              'content-type': res.headers['content-type'] || '',
              'cache-control': res.headers['cache-control'] || '',
              'x-robots-tag': res.headers['x-robots-tag'] || '',
            },
            title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '',
            description:
              (body.match(
                /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
              ) || [])[1] || '',
            canonical:
              (body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) || [])[1] || '',
            hash: simpleHash(text),
            bytes: Buffer.byteLength(body),
          });
        });
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
    req.on('error', (err) => resolve({ status: 0, error: String(err.message || err) }));
    req.end();
  });
}

function normalizeForHash(body) {
  return body
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, '<ts>')
    .replace(/\s+/g, ' ')
    .trim();
}

function simpleHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function capture(results, outDir) {
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, 'snapshot.json');
  writeFileSync(
    file,
    JSON.stringify({ captured_at: new Date().toISOString(), pages: results }, null, 2),
    'utf8'
  );
  return file;
}

function compare(results, baselineDir, ignoreHash = new Set()) {
  const file = join(baselineDir, 'snapshot.json');
  if (!existsSync(file)) {
    console.error(`✖ baseline not found: ${file}`);
    return 1;
  }
  const baseline = JSON.parse(readFileSync(file, 'utf8')).pages;
  const diffs = [];

  for (const [path, current] of Object.entries(results)) {
    const before = baseline[path];
    if (!before) {
      diffs.push(`${path}: NEW page (not in baseline)`);
      continue;
    }
    for (const key of ['status', 'title', 'description', 'canonical', 'hash']) {
      if (key === 'hash' && ignoreHash.has(path)) continue;
      if (String(before[key] ?? '') !== String(current[key] ?? '')) {
        diffs.push(
          `${path} › ${key}\n    before: ${String(before[key] ?? '').slice(0, 120)}\n    after : ${String(current[key] ?? '').slice(0, 120)}`
        );
      }
    }
  }

  for (const path of Object.keys(baseline)) {
    if (!results[path]) diffs.push(`${path}: REMOVED (was in baseline)`);
  }

  if (diffs.length === 0) {
    console.log('✔ snapshot identical — 0 differences');
    return 0;
  }
  console.log(`✖ ${diffs.length} difference(s):\n`);
  for (const diff of diffs) console.log(`  - ${diff}`);
  return 2;
}

async function main() {
  const args = parseArgs(process.argv);
  const base = typeof args.base === 'string' ? args.base : 'http://localhost:3000';
  const host = typeof args.host === 'string' ? args.host : '';
  const routes = (typeof args.routes === 'string' ? args.routes.split(',') : DEFAULT_ROUTES).filter(Boolean);

  const results = {};
  for (const path of routes) {
    results[path] = await fetchPage(base, path, host);
    const r = results[path];
    console.log(`${r.status}  ${path}${r.error ? `  (${r.error})` : ''}`);
  }

  if (typeof args.compare === 'string') {
    const ignoreHash = new Set(
      (typeof args['ignore-hash'] === 'string'
        ? args['ignore-hash'].split(',')
        : ['/sitemap.xml']
      ).filter(Boolean)
    );
    process.exitCode = compare(results, args.compare, ignoreHash);
    return;
  }

  const outDir =
    typeof args.out === 'string'
      ? args.out
      : join('scratch', 'snapshots', new Date().toISOString().replace(/[:.]/g, '-'));
  const file = capture(results, outDir);
  console.log(`\n✔ baseline written: ${file}`);
}

main().catch((err) => {
  console.error(`✖ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
