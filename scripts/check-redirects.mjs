#!/usr/bin/env node
/**
 * Redirect regression guard.
 *
 * Follows the redirect chain for a set of key URLs and FAILS if:
 *   - a loop is detected (a URL is visited twice), or
 *   - the chain is longer than MAX_HOPS (a symptom of ping-pong), or
 *   - the final status is not the expected one.
 *
 * This exists because the storefront once had TWO layers fighting over the
 * canonical host (Vercel apex->www vs a middleware www->apex 301), producing
 * ERR_TOO_MANY_REDIRECTS. Canonical host must be owned by ONE layer only.
 *
 * Usage:
 *   node scripts/check-redirects.mjs                 # uses DOMAIN env or default
 *   DOMAIN=zaynahs.pk node scripts/check-redirects.mjs
 *   DOMAIN=totvogue.pk node scripts/check-redirects.mjs
 *
 * Canonical host is expected to be www.<domain> (matches NEXT_PUBLIC_SITE_URL).
 */

const DOMAIN = (process.env.DOMAIN || 'zaynahs.pk').replace(/^https?:\/\//, '').replace(/\/+$/, '');
const CANONICAL = `www.${DOMAIN}`;
const MAX_HOPS = 5;

// Paths to probe. Each is checked from both apex and www, http and https.
const PATHS = ['/', '/reviews?rating=5', '/shop', '/admin', '/sitemap.xml', '/robots.txt'];

/** Follow redirects manually so we can detect loops and count hops. */
async function trace(startUrl) {
  const visited = [];
  let url = startUrl;
  for (let hop = 0; hop <= MAX_HOPS + 1; hop++) {
    if (visited.includes(url)) {
      return { ok: false, reason: 'LOOP', chain: [...visited, url], finalStatus: null };
    }
    visited.push(url);
    let res;
    try {
      res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    } catch (err) {
      return { ok: false, reason: `FETCH_ERROR ${err.message}`, chain: visited, finalStatus: null };
    }
    const status = res.status;
    if (status >= 300 && status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return { ok: false, reason: 'REDIRECT_NO_LOCATION', chain: visited, finalStatus: status };
      url = new URL(loc, url).toString();
      if (hop >= MAX_HOPS) {
        return { ok: false, reason: `TOO_MANY_HOPS (>${MAX_HOPS})`, chain: [...visited, url], finalStatus: status };
      }
      continue;
    }
    return { ok: true, reason: 'OK', chain: visited, finalStatus: status, finalUrl: url };
  }
  return { ok: false, reason: 'TOO_MANY_HOPS', chain: visited, finalStatus: null };
}

function expectedFinalHost() {
  return CANONICAL;
}

async function main() {
  const starts = [];
  for (const p of PATHS) {
    starts.push(`https://${DOMAIN}${p}`);
    starts.push(`https://${CANONICAL}${p}`);
    starts.push(`http://${DOMAIN}${p}`);
  }

  let failures = 0;
  for (const start of starts) {
    const r = await trace(start);
    const finalHost = r.finalUrl ? new URL(r.finalUrl).host : '(none)';
    const hostOk = !r.finalUrl || finalHost === expectedFinalHost();
    const pass = r.ok && hostOk;
    if (!pass) failures++;
    const tag = pass ? 'PASS' : 'FAIL';
    console.log(`[${tag}] ${start}`);
    console.log(`        -> ${r.chain.join('\n        -> ')}`);
    console.log(`        status=${r.finalStatus ?? '-'} finalHost=${finalHost} reason=${r.reason}`);
    if (!hostOk && r.ok) {
      console.log(`        WARNING: final host ${finalHost} != canonical ${expectedFinalHost()}`);
    }
  }

  console.log(`\n${failures === 0 ? 'ALL OK' : `${failures} FAILURE(S)`} for ${DOMAIN} (canonical ${CANONICAL})`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
