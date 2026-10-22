# ⚡ Universal Store Stress & Ceiling Testing Guide

This guide documents the **Universal Store Stress & Ceiling Load Testing Engine** (`scripts/max-ceiling-stress.mjs`). It allows any developer or agent to test throughput, edge cache absorption, and concurrency ceilings on **ANY project or future clone** without hardcoding domains.

---

## 🎯 Core Principles (Zero Hardcoding)

1. **No Hardcoded Domains**: Never hardcode domains in scripts or documentation.
2. **Dynamic Store Resolution**:
   - Via `--store=<store_name>`: Automatically reads `NEXT_PUBLIC_SITE_URL` from `env-backups/<store>.env.local`.
   - Via `--url=https://<your-domain>`: Works with any arbitrary URL (staging, preview, production).
   - Via Local Env: Falls back to `.env.local` if no arguments are passed.
3. **Automatic Route Discovery**: Dynamically scans the storefront homepage and discovers active category and product URLs to test a realistic customer browsing path.
4. **Browser Header Parity**: Sends realistic HTTP headers (`User-Agent`, `Accept-Encoding: gzip, deflate, br, zstd`) to ensure Cloudflare delivers compressed Brotli responses (matching real mobile buyers).

---

## 🚀 Quick Start Commands

### 1. Run via Store Identifier (from `env-backups/`)
```bash
# Default 10,000 requests, 40 concurrency
node scripts/max-ceiling-stress.mjs --store=<store_name>

# Custom volume & concurrency
node scripts/max-ceiling-stress.mjs --store=<store_name> --requests=25000 --concurrency=50
```

### 2. Run via Direct URL (Any Domain / Clone / Staging)
```bash
node scripts/max-ceiling-stress.mjs --url=https://<your-domain> --requests=10000 --concurrency=40
```

### 3. Quick Smoke Test (50 Requests)
```bash
node scripts/max-ceiling-stress.mjs --store=<store_name> --requests=50 --concurrency=5
```

### 4. NPM Script Shortcut (Uses current `.env.local`)
```bash
npm run stress:test -- --requests=5000 --concurrency=25
```

---

## 📊 Available CLI Options

| Flag | Default | Description |
|---|---|---|
| `--store=<name>` | `""` | Name of the store in `env-backups/<name>.env.local` |
| `--url=<https://...>` | `""` | Target domain or URL (takes precedence over `--store`) |
| `--requests=<N>` | `10000` | Total number of requests to execute |
| `--concurrency=<C>` | `40` | Number of simultaneous concurrent worker connections |
| `--duration=<sec>` | `0` | Optional maximum test duration in seconds (0 = disabled) |

---

## 📈 Interpreting Test Results

At completion, the engine prints a comprehensive performance matrix:

```
===============================================================
🏆 STRESS & CEILING TEST RESULTS SUMMARY
===============================================================
┌─────────┬───────────────────────────────────────┬───────────────────────────────┐
│ (index) │ Metric                                │ Value                         │
├─────────┼───────────────────────────────────────┼───────────────────────────────┤
│ 0       │ 'Target Store'                        │ 'https://<your-domain>'       │
│ 1       │ 'Total Requests Delivered'            │ '10,000'                      │
│ 2       │ 'Successful Responses (2xx/3xx)'      │ '10,000'                      │
│ 3       │ 'Client Errors (4xx)'                 │ 0                             │
│ 4       │ 'Server Crashes / Errors (5xx)'       │ 0                             │
│ 5       │ 'Network Dropouts'                    │ 0                             │
│ 6       │ 'Total Execution Time'                │ '45.12 seconds'               │
│ 7       │ 'Average Request Throughput'          │ '221.6 req/sec'               │
│ 8       │ 'Cloudflare Cache HIT Ratio'          │ '98.50%'                      │
│ 9       │ 'Total Bandwidth Delivered'           │ '1.52 GB'                     │
│ 10      │ 'Origin Load (Vercel)'                │ '12.40 MB'                    │
│ 11      │ 'Traffic Absorbed by Cloudflare Edge' │ '1507.60 MB (99.2%)'          │
│ 12      │ 'Average Response TTFB'               │ '68.4 ms'                     │
│ 13      │ 'Median Latency (p50)'                │ '62 ms'                       │
│ 14      │ '95th Percentile Latency (p95)'       │ '94 ms'                       │
│ 15      │ '99th Percentile Latency (p99)'       │ '145 ms'                      │
└─────────┴───────────────────────────────────────┴───────────────────────────────┘
🎉 100% PASS: Zero server crashes (0 5xx). The edge caching architecture successfully shielded Vercel and Supabase.
```

### Key Verification Metrics:
1. **Server Errors (5xx)**: Must be **0**. Any 5xx indicates an unhandled exception or origin timeout.
2. **Cloudflare Cache HIT Ratio**: Must be **> 95%** on catalog routes.
3. **Traffic Absorbed by Cloudflare**: Should be **> 98%**, meaning Vercel origin handles less than 2% of total delivered bandwidth.
4. **Average Response TTFB**: Should remain **sub-100ms** on cached edge responses.

---

## 🛡️ Free Tier Quota Shield Architecture

1. **Vercel Free Tier (100 GB Fast Data Transfer)**:
   - When 98% of traffic is answered by Cloudflare Edge with `CF-Cache-Status: HIT`, a 10 GB traffic surge consumes less than **150 MB** of Vercel bandwidth.
2. **Supabase Free Tier (500 MB DB Storage & Connection Limits)**:
   - Catalog pages are pre-rendered and cached at the edge. Zero queries touch Postgres during read traffic surges.
   - For order/checkout endpoints, the **Frictionless Bot & Anti-Abuse Shield** (`lib/security/abuseProtection.ts`) rejects automated bot attacks in `< 0.1ms` before database writes, preserving database storage and connection pools.
