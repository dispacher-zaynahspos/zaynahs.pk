/**
 * Fast & Robust Multi-Store Network Verifier (RULE ROLLOUT1 & RULE CRED-ENVBACKUP)
 * Dynamically discovers active stores from env-backups/*.env.local.
 * Tests edge speed (TTFB), Cloudflare cache headers, live plain URL price freshness,
 * and full relational order checkout flow.
 *
 * Usage:
 *   npm run verify:network               # Sequentially verifies all stores (safe & clean)
 *   npm run verify:network -- --store=lobo # Verifies a single store
 *   npm run verify:network -- --parallel  # Runs all stores concurrently (blazing fast)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const ENV_DIR = path.resolve('env-backups');

function loadEnvFile(filePath) {
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

function getStores() {
  const files = fs.readdirSync(ENV_DIR).filter(f => f.endsWith('.env.local'));
  const stores = [];
  for (const file of files) {
    const storeName = file.replace('.env.local', '');
    const env = loadEnvFile(path.join(ENV_DIR, file));
    if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SITE_URL) {
      stores.push({
        name: storeName,
        envFile: file,
        domain: env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '').replace(/^http:\/\//, 'https://'),
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
        revalidateSecret: env.REVALIDATE_SECRET || 'zaynahs_secret_cache_revalidate_2026'
      });
    }
  }
  return stores;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function measureSpeed(url) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'NetworkVerifier/2.0' } });
    const t1 = Date.now();
    const cf = res.headers.get('cf-cache-status') || 'unknown';
    const vercel = res.headers.get('x-vercel-cache') || 'unknown';
    await res.text();
    return { timeMs: t1 - t0, cf, vercel, status: res.status };
  } catch (err) {
    return { timeMs: -1, cf: 'ERR', vercel: 'ERR', status: 500, error: err.message };
  }
}

async function verifyStore(store) {
  console.log(`\n====================================================`);
  console.log(`▶ VERIFYING STORE: ${store.name.toUpperCase()} (${store.domain})`);
  console.log(`====================================================`);

  const supabase = createClient(store.supabaseUrl, store.supabaseKey);

  // 1. Get active clean products (prefer has_variants = false, then shortest slug)
  let { data: prods, error: pErr } = await supabase
    .from('products')
    .select('id, name, slug, price, has_variants')
    .eq('is_active', true)
    .is('deleted_at', null)
    .eq('has_variants', false)
    .not('price', 'is', null)
    .limit(10);

  if (!prods || prods.length === 0) {
    const fallback = await supabase
      .from('products')
      .select('id, name, slug, price, has_variants')
      .eq('is_active', true)
      .is('deleted_at', null)
      .not('price', 'is', null)
      .limit(15);
    prods = fallback.data || [];
  }

  // Pick active product with the cleanest/shortest slug
  prods = (prods || []).sort((a, b) => a.slug.length - b.slug.length).slice(0, 1);

  if (pErr || !prods || prods.length === 0) {
    console.error(`❌ Could not find active product for ${store.name}:`, pErr);
    return {
      Store: store.name,
      Domain: store.domain,
      'Home TTFB': 'ERR',
      'Shop TTFB': 'ERR',
      'Product TTFB': 'ERR',
      'Price Freshness': 'FAIL: No Product',
      'Order Test': 'SKIPPED'
    };
  }

  const prod = prods[0];
  const originalPrice = Number(prod.price);
  const testPrice = originalPrice + 99;
  const productUrl = `${store.domain}/product/${prod.slug}`;
  console.log(`Product: "${prod.name}" | Current Price: Rs. ${originalPrice}`);

  // 2. Measure Edge Speeds (Pre-warmed)
  console.log(`Measuring Edge Speeds...`);
  await measureSpeed(`${store.domain}/`);
  await measureSpeed(`${store.domain}/shop`);
  await measureSpeed(productUrl);

  const homeSpeed = await measureSpeed(`${store.domain}/`);
  const shopSpeed = await measureSpeed(`${store.domain}/shop`);
  const prodSpeed = await measureSpeed(productUrl);

  console.log(`- Home:    ${homeSpeed.timeMs}ms (CF: ${homeSpeed.cf})`);
  console.log(`- Shop:    ${shopSpeed.timeMs}ms (CF: ${shopSpeed.cf})`);
  console.log(`- Product: ${prodSpeed.timeMs}ms (CF: ${prodSpeed.cf})`);

  // 3. Live Plain URL Freshness Test (NO ?_t=)
  console.log(`\nTesting Live Plain URL Freshness...`);
  console.log(`Updating DB price to Rs. ${testPrice}...`);
  await supabase.from('products').update({ price: testPrice }).eq('id', prod.id);
  await supabase.from('product_variants').update({ price: testPrice }).eq('product_id', prod.id);

  // Trigger targeted revalidation
  const revalRes = await fetch(`${store.domain}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': store.revalidateSecret
    },
    body: JSON.stringify({
      type: 'UPDATE',
      table: 'products',
      record: { id: prod.id, slug: prod.slug }
    })
  });
  console.log(`Revalidate webhook status: ${revalRes.status}`);

  const startPoll = Date.now();
  let freshnessSeconds = 'timeout';
  const formattedTestPrice = Number(testPrice).toLocaleString('en-PK');

  // Poll every 1s for up to 30 seconds (Next.js SSR re-render takes ~5-10s)
  try {
    for (let i = 1; i <= 30; i++) {
      await sleep(1000);
      const elapsed = ((Date.now() - startPoll) / 1000).toFixed(1);
      try {
        const res = await fetch(productUrl, { headers: { 'User-Agent': 'NetworkVerifier/2.0' } });
        const cf = res.headers.get('cf-cache-status') || 'unknown';
        const vercel = res.headers.get('x-vercel-cache') || 'unknown';
        const html = await res.text();

        const rawPriceStr = String(testPrice);
        const priceRegex = new RegExp(`Rs\\.?\\s*${rawPriceStr}`, 'i');
        const formattedRegex = new RegExp(`Rs\\.?\\s*${formattedTestPrice.replace(/,/g, '[,]?')}`, 'i');
        const schemaPriceRegex = new RegExp(`"price":\\s*"?${rawPriceStr}"?`);
        const hasPrice = priceRegex.test(html) ||
                         formattedRegex.test(html) ||
                         schemaPriceRegex.test(html);

        if (hasPrice) {
          freshnessSeconds = `${elapsed}s`;
          console.log(`✅ [${elapsed}s] Price Rs. ${testPrice} REFLECTED! (CF: ${cf}, Vercel: ${vercel})`);
          break;
        } else {
          if (i % 2 === 0) {
            console.log(`   [${elapsed}s] Waiting for edge refresh... (CF: ${cf}, Vercel: ${vercel})`);
          }
        }
      } catch (pollErr) {
        // Transient network retry
      }
    }
  } finally {
    // Revert price back immediately
    console.log(`Reverting price back to Rs. ${originalPrice}...`);
    await supabase.from('products').update({ price: originalPrice }).eq('id', prod.id);
    await supabase.from('product_variants').update({ price: originalPrice }).eq('product_id', prod.id);
    await fetch(`${store.domain}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': store.revalidateSecret
      },
      body: JSON.stringify({
        type: 'UPDATE',
        table: 'products',
        record: { id: prod.id, slug: prod.slug }
      })
    }).catch(() => {});
  }

  // 4. Real Application Checkout Relational Flow Test
  console.log(`\nTesting Real Checkout Relational Flow...`);
  const orderNumber = `${store.name.toUpperCase().slice(0, 4)}-TEST-${Date.now().toString().slice(-4)}`;
  const testPhone = '03001234567';
  const accessToken = crypto.randomUUID();

  // Find or create customer record
  let customerId = null;
  const { data: existingCust } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', testPhone)
    .maybeSingle();

  if (existingCust) {
    customerId = existingCust.id;
  } else {
    const { data: newCust } = await supabase
      .from('customers')
      .insert({
        name: `${store.name} Verifier Customer`,
        phone: testPhone,
        email: 'test@example.com'
      })
      .select('id')
      .single();
    customerId = newCust?.id || null;
  }

  // Insert full order with items JSON
  const itemPayload = [{
    id: prod.id,
    product: { id: prod.id, name: prod.name, price: originalPrice, slug: prod.slug },
    quantity: 1,
    unit_price: originalPrice,
    total_price: originalPrice
  }];

  const { data: newOrder, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: `${store.name} Test Customer`,
      customer_phone: testPhone,
      customer_email: 'test@example.com',
      subtotal: originalPrice,
      total: originalPrice,
      shipping_amount: 0,
      discount_amount: 0,
      status: 'pending',
      items: itemPayload,
      access_token: accessToken,
      notes: 'Test order from automated network verification script'
    })
    .select('id, order_number, total, status')
    .single();

  let orderVerified = false;
  if (orderErr || !newOrder) {
    console.error(`❌ Order creation failed:`, orderErr);
  } else {
    // Insert order_addresses
    const { error: addrErr } = await supabase.from('order_addresses').insert({
      order_id: newOrder.id,
      name: `${store.name} Test Customer`,
      phone: testPhone,
      address1: 'Automated Test Address 123',
      city: 'Karachi',
      country: 'Pakistan',
      payment_method: 'Cash on delivery'
    });
    if (addrErr) console.warn('order_addresses insert note:', addrErr.message);

    // Insert order_items
    const { error: itemErr } = await supabase.from('order_items').insert({
      order_id: newOrder.id,
      product_id: prod.id,
      name: prod.name,
      quantity: 1,
      unit_price: originalPrice,
      line_total: originalPrice
    });
    if (itemErr) console.warn('order_items insert note:', itemErr.message);

    // Full Admin Query Verification (Relational Join)
    const { data: adminCheck } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        order_items (id, name, unit_price),
        order_addresses (id, name, city)
      `)
      .eq('id', newOrder.id)
      .single();

    if (
      adminCheck?.order_number === orderNumber &&
      adminCheck.order_items?.length > 0 &&
      adminCheck.order_addresses?.length > 0
    ) {
      orderVerified = true;
      console.log(`✅ Admin Query Verified: ${adminCheck.order_number} (Rs. ${adminCheck.total}) with ${adminCheck.order_items.length} items & address in ${adminCheck.order_addresses[0].city}`);
    }

    // Clean up
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', newOrder.id);
    await supabase.from('order_items').delete().eq('order_id', newOrder.id);
    await supabase.from('order_addresses').delete().eq('order_id', newOrder.id);
    await supabase.from('orders').delete().eq('id', newOrder.id);
    console.log(`✅ Test order cleanly deleted from all relational tables.`);
  }

  return {
    Store: store.name,
    Domain: store.domain,
    'Home TTFB': `${homeSpeed.timeMs}ms (${homeSpeed.cf})`,
    'Shop TTFB': `${shopSpeed.timeMs}ms (${shopSpeed.cf})`,
    'Product TTFB': `${prodSpeed.timeMs}ms (${prodSpeed.cf})`,
    'Price Freshness': freshnessSeconds,
    'Order Test': orderVerified ? 'PASS ✅' : 'FAIL ❌'
  };
}

async function main() {
  const stores = getStores();
  console.log(`Found ${stores.length} active stores in env-backups/:`);
  stores.forEach(s => console.log(` - ${s.name} (${s.domain})`));

  const argStore = process.argv.find(a => a.startsWith('--store='))?.split('=')[1];
  const isParallel = process.argv.includes('--parallel');
  const targetStores = argStore ? stores.filter(s => s.name === argStore) : stores;

  let results = [];
  if (isParallel) {
    console.log(`\n⚡ Running verification in PARALLEL mode across ${targetStores.length} stores...`);
    results = await Promise.all(targetStores.map(verifyStore));
  } else {
    for (const store of targetStores) {
      const res = await verifyStore(store);
      results.push(res);
    }
  }

  console.log(`\n====================================================`);
  console.log(`🏆 ALL STORE NETWORK VERIFICATION SUMMARY`);
  console.log(`====================================================`);
  console.table(results);
}

main().catch(console.error);
