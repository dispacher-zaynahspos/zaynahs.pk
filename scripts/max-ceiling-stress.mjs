#!/usr/bin/env node

/**
 * Universal Store Stress & Ceiling Load Testing Engine
 * 
 * Tests edge CDN absorption, cache hit ratios, and throughput
 * WITHOUT hardcoded domains or credentials.
 * 
 * Usage:
 *   node scripts/max-ceiling-stress.mjs --store=<store_name>
 *   node scripts/max-ceiling-stress.mjs --url=https://<your-store-url>
 *   node scripts/max-ceiling-stress.mjs --store=<store_name> --requests=20000 --concurrency=50
 */

import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    store: '',
    url: '',
    requests: 10000,
    concurrency: 40,
    durationSec: 0, // 0 = request-count driven
  };

  for (const arg of args) {
    if (arg.startsWith('--store=')) options.store = arg.split('=')[1].trim();
    else if (arg.startsWith('--url=')) options.url = arg.split('=')[1].trim();
    else if (arg.startsWith('--requests=')) options.requests = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--concurrency=')) options.concurrency = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--duration=')) options.durationSec = parseInt(arg.split('=')[1], 10);
  }
  return options;
}

// Dynamically resolve target URL from --url, --store, or .env.local
function resolveTargetUrl(options) {
  if (options.url) {
    return options.url.replace(/\/+$/, '');
  }

  // If store specified, read from env-backups/<store>.env.local
  if (options.store) {
    const backupPath = path.join(process.cwd(), 'env-backups', `${options.store}.env.local`);
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, 'utf8');
      const match = content.match(/NEXT_PUBLIC_SITE_URL=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
      }
    }
    console.error(`❌ Could not find NEXT_PUBLIC_SITE_URL in env-backups/${options.store}.env.local`);
    process.exit(1);
  }

  // Fallback: Read from local .env.local
  const localEnvPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    const content = fs.readFileSync(localEnvPath, 'utf8');
    const match = content.match(/NEXT_PUBLIC_SITE_URL=([^\r\n]+)/);
    if (match && match[1]) {
      return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
    }
  }

  console.error('❌ Target URL not specified.');
  console.log('Usage:');
  console.log('  node scripts/max-ceiling-stress.mjs --store=<store_name>');
  console.log('  node scripts/max-ceiling-stress.mjs --url=https://<your-store-url>');
  process.exit(1);
}

// Discover testable endpoints dynamically from the store
async function discoverEndpoints(baseUrl) {
  const endpoints = ['/', '/shop'];
  try {
    const res = await fetch(`${baseUrl}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
      },
    });
    const html = await res.text();
    // Extract first 4 product links dynamically from page HTML
    const productMatches = [...html.matchAll(/href="(\/product\/[^"/?#]+)"/g)];
    const uniqueSlugs = [...new Set(productMatches.map(m => m[1]))].slice(0, 4);
    for (const slug of uniqueSlugs) {
      endpoints.push(slug);
    }
  } catch {
    // Fallback to standard routes
  }
  return endpoints;
}

// Formatting helpers
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

async function runStressTest() {
  const options = parseArgs();
  const targetUrl = resolveTargetUrl(options);

  console.log('\n===============================================================');
  console.log('⚡ STORE CEILING & EDGE STRESS ENGINE');
  console.log('===============================================================');
  console.log(`🎯 Target Store:       ${targetUrl}`);
  console.log(`📦 Target Requests:    ${options.requests.toLocaleString()}`);
  console.log(`⚡ Concurrency Level:  ${options.concurrency} concurrent workers`);
  console.log('🔍 Discovering store routes...');

  const endpoints = await discoverEndpoints(targetUrl);
  console.log(`✓ Active Routes (${endpoints.length}): ${endpoints.join(', ')}`);

  // Pre-warm Edge Cache
  console.log('🔥 Pre-warming edge cache...');
  for (const ep of endpoints) {
    try {
      await fetch(`${targetUrl}${ep}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
        },
      });
    } catch {
      // ignore
    }
  }
  console.log('🚀 Pre-warming complete. Commencing load test!\n');

  // Metrics tracking
  let completed = 0;
  let successCount = 0;
  let clientErrors = 0; // 4xx
  let serverErrors = 0; // 5xx
  let networkErrors = 0;
  let totalBytes = 0;
  let originBytes = 0;

  const cfStats = { HIT: 0, MISS: 0, DYNAMIC: 0, OTHER: 0 };
  const latencies = [];
  const startTime = Date.now();
  let stopFlag = false;

  // Live status ticker
  const interval = setInterval(() => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rps = (completed / elapsedSec).toFixed(1);
    const hitRate = completed > 0 ? ((cfStats.HIT / completed) * 100).toFixed(1) : '0';
    process.stdout.write(
      `\r⏳ [${elapsedSec.toFixed(0)}s] Progress: ${completed.toLocaleString()}/${options.requests.toLocaleString()} | ` +
      `Speed: ${rps} req/s | CF Hit: ${hitRate}% | Bandwidth: ${formatBytes(totalBytes)} | 5xx: ${serverErrors}   `
    );

    if (options.durationSec > 0 && elapsedSec >= options.durationSec) {
      stopFlag = true;
    }
  }, 1000);

  // Worker loop
  async function worker() {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    while (!stopFlag && completed < options.requests) {
      // Round-robin endpoint selection
      const endpoint = endpoints[completed % endpoints.length];
      const url = `${targetUrl}${endpoint}`;

      const t0 = Date.now();
      try {
        const res = await fetch(url, { headers });
        const latency = Date.now() - t0;
        latencies.push(latency);

        const buf = await res.arrayBuffer();
        const size = buf.byteLength;
        totalBytes += size;

        const cfStatus = (res.headers.get('cf-cache-status') || '').toUpperCase();
        if (cfStatus === 'HIT') cfStats.HIT++;
        else if (cfStatus === 'MISS') {
          cfStats.MISS++;
          originBytes += size;
        } else if (cfStatus === 'DYNAMIC') {
          cfStats.DYNAMIC++;
          originBytes += size;
        } else {
          cfStats.OTHER++;
        }

        if (res.status >= 200 && res.status < 400) successCount++;
        else if (res.status >= 400 && res.status < 500) clientErrors++;
        else if (res.status >= 500) serverErrors++;
      } catch {
        networkErrors++;
      } finally {
        completed++;
      }
    }
  }

  // Launch workers
  const workerPool = [];
  for (let i = 0; i < options.concurrency; i++) {
    workerPool.push(worker());
  }
  await Promise.all(workerPool);

  clearInterval(interval);
  const totalElapsed = (Date.now() - startTime) / 1000;

  // Calculate percentiles
  latencies.sort((a, b) => a - b);
  const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const hitPercentage = completed > 0 ? ((cfStats.HIT / completed) * 100).toFixed(2) : '0';
  const edgeAbsorbedMb = (totalBytes - originBytes) / (1024 * 1024);

  console.log('\n\n===============================================================');
  console.log('🏆 STRESS & CEILING TEST RESULTS SUMMARY');
  console.log('===============================================================');
  console.table([
    { Metric: 'Target Store', Value: targetUrl },
    { Metric: 'Total Requests Delivered', Value: completed.toLocaleString() },
    { Metric: 'Successful Responses (2xx/3xx)', Value: successCount.toLocaleString() },
    { Metric: 'Client Errors (4xx)', Value: clientErrors },
    { Metric: 'Server Crashes / Errors (5xx)', Value: serverErrors },
    { Metric: 'Network Dropouts', Value: networkErrors },
    { Metric: 'Total Execution Time', Value: `${totalElapsed.toFixed(2)} seconds` },
    { Metric: 'Average Request Throughput', Value: `${(completed / totalElapsed).toFixed(1)} req/sec` },
    { Metric: 'Cloudflare Cache HIT Ratio', Value: `${hitPercentage}%` },
    { Metric: 'Total Bandwidth Delivered', Value: formatBytes(totalBytes) },
    { Metric: 'Origin Load (Vercel)', Value: formatBytes(originBytes) },
    { Metric: 'Traffic Absorbed by Cloudflare Edge', Value: `${edgeAbsorbedMb.toFixed(2)} MB (${((1 - (originBytes / (totalBytes || 1))) * 100).toFixed(1)}%)` },
    { Metric: 'Average Response TTFB', Value: `${avgLatency} ms` },
    { Metric: 'Median Latency (p50)', Value: `${p50} ms` },
    { Metric: '95th Percentile Latency (p95)', Value: `${p95} ms` },
    { Metric: '99th Percentile Latency (p99)', Value: `${p99} ms` },
  ]);

  if (serverErrors === 0) {
    console.log('🎉 100% PASS: Zero server crashes (0 5xx). The edge caching architecture successfully shielded Vercel and Supabase.\n');
  } else {
    console.log(`⚠️ CAUTION: ${serverErrors} server error(s) detected during high stress load.\n`);
  }
}

runStressTest().catch(err => {
  console.error('Fatal stress test error:', err);
  process.exit(1);
});
