#!/usr/bin/env node
/**
 * Dynamic Multi-Store Product Listing & Sample Inspiration Engine
 *
 * ZERO HARDCODED DOMAINS OR CREDENTIALS.
 * All URLs, API keys, and store settings are dynamically loaded from
 * the project environment file or CLI flags.
 *
 * Usage:
 *   node scripts/store-list-product.cjs --env <path-to-.env.local> --sample "<Sample Name>" --title "<New Title>" [--price 1849] [--compare-price 2850]
 *   node scripts/store-list-product.cjs --project-dir <path-to-store-repo> --sample "<Sample Name>" --title "<New Title>"
 *   node scripts/store-list-product.cjs --config ./listing.json
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    envFile: null,
    projectDir: null,
    sample: null,
    title: null,
    price: null,
    comparePrice: null,
    linkWith: [],
    configPath: null,
    siteUrl: null,
    supabaseUrl: null,
    serviceKey: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--env") options.envFile = args[++i];
    else if (arg === "--project-dir" || arg === "--project") options.projectDir = args[++i];
    else if (arg === "--sample") options.sample = args[++i];
    else if (arg === "--title") options.title = args[++i];
    else if (arg === "--price") options.price = args[++i];
    else if (arg === "--compare-price") options.comparePrice = args[++i];
    else if (arg === "--link-with") options.linkWith = args[++i].split(",").map(s => s.trim());
    else if (arg === "--config") options.configPath = args[++i];
    else if (arg === "--site-url") options.siteUrl = args[++i];
    else if (arg === "--supabase-url") options.supabaseUrl = args[++i];
    else if (arg === "--service-key") options.serviceKey = args[++i];
  }
  return options;
}

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
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

function resolveConfig(cliOptions) {
  let env = {};

  // 1. Specified env file
  if (cliOptions.envFile && fs.existsSync(cliOptions.envFile)) {
    env = loadEnv(cliOptions.envFile);
  } else if (cliOptions.projectDir) {
    // Try candidate env files in project directory
    const candidates = [
      path.join(cliOptions.projectDir, ".env.local"),
      path.join(cliOptions.projectDir, ".env"),
      path.join(cliOptions.projectDir, "env-backups", "totvogue.env.local")
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        env = loadEnv(c);
        break;
      }
    }
  } else {
    // Current working directory or default parent candidates
    const localCandidates = [
      path.resolve(".env.local"),
      path.resolve(".env"),
      path.resolve("../zaynahsestore-tv-main/env-backups/totvogue.env.local"),
      path.resolve("/Users/shoaib/Desktop/zaynahsestore-tv-main/env-backups/totvogue.env.local")
    ];
    for (const c of localCandidates) {
      if (fs.existsSync(c)) {
        env = loadEnv(c);
        break;
      }
    }
  }

  const supabaseUrl =
    cliOptions.supabaseUrl ||
    process.env.SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.SUPABASE_URL;

  const serviceKey =
    cliOptions.serviceKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY;

  const siteUrl =
    cliOptions.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    env.NEXT_PUBLIC_SITE_URL ||
    env.SITE_URL;

  const revalidateSecret =
    process.env.REVALIDATE_SECRET ||
    env.REVALIDATE_SECRET;

  const cfZone =
    process.env.CLOUDFLARE_ZONE_ID ||
    env.CLOUDFLARE_ZONE_ID;

  const cfToken =
    process.env.CLOUDFLARE_API_TOKEN ||
    env.CLOUDFLARE_API_TOKEN;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing database credentials. Please provide --env <file> or --project-dir <path> containing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    supabaseUrl,
    serviceKey,
    siteUrl,
    revalidateSecret,
    cfZone,
    cfToken
  };
}

function apiRequest(config, method, endpoint, body = null, host = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const targetHost = host || config.supabaseUrl;
    const url = new URL(endpoint, targetHost);
    const headers = {
      apikey: config.serviceKey,
      Authorization: "Bearer " + config.serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extraHeaders
    };
    const req = https.request(url, { method, headers }, res => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function findSampleProduct(config, query) {
  let endpoint = `/rest/v1/products?select=*,product_categories(*),product_variants(*)&limit=1`;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query)) {
    endpoint = `/rest/v1/products?id=eq.${query}&select=*,product_categories(*),product_variants(*)`;
  } else {
    endpoint = `/rest/v1/products?name=ilike.*${encodeURIComponent(query)}*&select=*,product_categories(*),product_variants(*)&limit=1`;
  }
  const res = await apiRequest(config, "GET", endpoint);
  if (!res.body || res.body.length === 0) {
    throw new Error(`Sample product not found for query: "${query}" on database ${config.supabaseUrl}`);
  }
  return res.body[0];
}

async function findMediaItem(config, query) {
  const enc = encodeURIComponent(query);
  const endpoint = `/rest/v1/media_library?or=(title.ilike.*${enc}*,alt_text.ilike.*${enc}*,original_filename.ilike.*${enc}*)&order=created_at.desc&limit=1`;
  const res = await apiRequest(config, "GET", endpoint);
  if (res.body && res.body.length > 0) {
    return res.body[0];
  }
  return null;
}

async function revalidateAndPurge(config, slugs) {
  if (!config.siteUrl) {
    console.log("[Cache] No siteUrl configured, skipping storefront revalidation.");
    return;
  }

  console.log(`[Cache] Revalidating storefront at ${config.siteUrl}...`);
  if (config.revalidateSecret) {
    for (const slug of slugs) {
      await apiRequest(
        config,
        "POST",
        "/api/revalidate",
        { type: "INSERT", table: "products", record: { slug } },
        config.siteUrl,
        { "x-revalidate-secret": config.revalidateSecret }
      ).catch(e => console.warn(`Revalidate failed for ${slug}:`, e.message));
    }
  }

  if (config.cfZone && config.cfToken) {
    const cfUrls = [
      `${config.siteUrl}/`,
      `${config.siteUrl}/shop`,
      ...slugs.map(s => `${config.siteUrl}/product/${s}`)
    ];
    await new Promise(resolve => {
      const req = https.request(
        `https://api.cloudflare.com/client/v4/zones/${config.cfZone}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.cfToken}`,
            "Content-Type": "application/json"
          }
        },
        res => {
          let d = "";
          res.on("data", c => (d += c));
          res.on("end", () => {
            console.log("[Cache] Cloudflare purge completed (HTTP " + res.statusCode + ")");
            resolve();
          });
        }
      );
      req.on("error", () => resolve());
      req.write(JSON.stringify({ files: cfUrls }));
      req.end();
    });
  }
}

async function listProducts(config, options) {
  const { sample: sampleQuery, items, linkTogether = true, linkWith = [] } = options;

  console.log(`[Sample] Loading template inspiration from: "${sampleQuery}"...`);
  const sample = await findSampleProduct(config, sampleQuery);
  console.log(`[Sample] Found: "${sample.name}" (ID: ${sample.id})`);

  const sortedSampleVariants = (sample.product_variants || [])
    .filter(v => v.size)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const sampleSizes = sortedSampleVariants.length > 0
    ? sortedSampleVariants.map((v, i) => ({ size: v.size, sort_order: v.sort_order || i + 1 }))
    : [
        { size: "2-3y", sort_order: 1 },
        { size: "3-4y", sort_order: 2 },
        { size: "4-5y", sort_order: 3 },
        { size: "5-6y", sort_order: 4 },
        { size: "7-8y", sort_order: 5 },
        { size: "9-10y", sort_order: 6 },
        { size: "11-12y", sort_order: 7 }
      ];

  const createdProducts = [];
  const allItemIds = [];

  for (const item of items) {
    const id = crypto.randomUUID();
    allItemIds.push(id);
    createdProducts.push({
      ...item,
      id,
      slug: item.slug || slugify(item.title || item.name)
    });
  }

  const crossLinkPool = [...linkWith];
  if (linkTogether) {
    crossLinkPool.push(...allItemIds);
  }

  const productRows = [];
  const variantRows = [];
  const imageRows = [];
  const categoryRows = [];

  for (const p of createdProducts) {
    const title = p.title || p.name;
    const price = Number(p.price || sample.price);
    const comparePrice = Number(p.compare_price || sample.compare_price || price);
    const cost = Number(p.cost || sample.cost || Math.round(price * 0.6));

    let media = null;
    if (!p.image_url) {
      media = await findMediaItem(config, title);
    }

    const imageUrl = p.image_url || media?.file_url;
    const altText = p.alt || media?.alt_text || `${title} for kids`;
    const description = p.description || media?.description || sample.description;
    const shortDesc = p.short_description || media?.caption || `Shop ${title}. Premium quality and comfort.`;
    const tags = p.tags || [title, "Kids Fashion", "Winter Wear", "Premium Wear"];

    const fbt = crossLinkPool.filter(id => id !== p.id);

    productRows.push({
      id: p.id,
      name: title,
      slug: p.slug,
      description: description,
      short_description: shortDesc,
      price: price,
      compare_price: comparePrice,
      cost: cost,
      category_id: sample.category_id,
      stock: sampleSizes.length * 100,
      has_variants: true,
      is_featured: true,
      is_service: false,
      enable_swatches: true,
      show_swatches_on_archive: true,
      tags: tags,
      rating: 5,
      reviews_count: 0,
      sort_order: 1,
      badge_enabled: sample.badge_enabled ?? true,
      custom_badge_id: sample.custom_badge_id || null,
      size_guide_id: sample.size_guide_id || null,
      frequently_bought_together_ids: fbt,
      flash_sale_enabled: false,
      inventory_threshold: 0,
      variation_order: sample.variation_order || ["size"],
      is_active: true
    });

    for (const s of sampleSizes) {
      variantRows.push({
        id: crypto.randomUUID(),
        product_id: p.id,
        size: s.size,
        color: null,
        price: price,
        compare_price: comparePrice,
        stock: 100,
        active: true,
        sort_order: s.sort_order,
        inventory_threshold: 0,
        show_image_swatch: false
      });
    }

    if (imageUrl) {
      imageRows.push({
        id: crypto.randomUUID(),
        product_id: p.id,
        url: imageUrl,
        alt: altText,
        sort_order: 0,
        is_primary: true,
        mime_type: "image/webp"
      });
    }

    for (const cat of sample.product_categories || []) {
      categoryRows.push({
        product_id: p.id,
        category_id: cat.category_id,
        position: cat.position || 1
      });
    }
  }

  console.log(`[DB] Inserting ${productRows.length} product(s)...`);
  const pRes = await apiRequest(config, "POST", "/rest/v1/products", productRows);
  if (pRes.status !== 201) throw new Error("Failed to insert products: " + JSON.stringify(pRes.body));

  console.log(`[DB] Inserting ${variantRows.length} variant(s)...`);
  const vRes = await apiRequest(config, "POST", "/rest/v1/product_variants", variantRows);
  if (vRes.status !== 201) throw new Error("Failed to insert variants: " + JSON.stringify(vRes.body));

  if (imageRows.length > 0) {
    console.log(`[DB] Inserting ${imageRows.length} image(s)...`);
    const iRes = await apiRequest(config, "POST", "/rest/v1/product_images", imageRows);
    if (iRes.status !== 201) throw new Error("Failed to insert images: " + JSON.stringify(iRes.body));
  }

  if (categoryRows.length > 0) {
    console.log(`[DB] Inserting ${categoryRows.length} category mapping(s)...`);
    const cRes = await apiRequest(config, "POST", "/rest/v1/product_categories", categoryRows);
    if (cRes.status !== 201) throw new Error("Failed to insert categories: " + JSON.stringify(cRes.body));
  }

  if (linkWith.length > 0) {
    console.log(`[FBT] Updating ${linkWith.length} existing product(s) with mutual links...`);
    for (const existingId of linkWith) {
      const getRes = await apiRequest(config, "GET", `/rest/v1/products?id=eq.${existingId}&select=frequently_bought_together_ids`);
      const currentFbt = getRes.body?.[0]?.frequently_bought_together_ids || [];
      const updatedFbt = Array.from(new Set([...currentFbt, ...allItemIds])).filter(id => id !== existingId);
      await apiRequest(config, "PATCH", `/rest/v1/products?id=eq.${existingId}`, {
        frequently_bought_together_ids: updatedFbt
      });
    }
  }

  const slugs = createdProducts.map(p => p.slug);
  await revalidateAndPurge(config, slugs);

  console.log("\n=======================================================");
  console.log(`✅ SUCCESS! Listed ${createdProducts.length} product(s):`);
  createdProducts.forEach(p => {
    const link = config.siteUrl ? `${config.siteUrl}/product/${p.slug}` : `/product/${p.slug}`;
    console.log(` • ${p.title || p.name} => ${link} (Rs. ${p.price || sample.price})`);
  });
  console.log("=======================================================\n");

  return createdProducts;
}

async function main() {
  const cliOptions = parseArgs();
  const config = resolveConfig(cliOptions);

  if (cliOptions.configPath) {
    const cfg = JSON.parse(fs.readFileSync(cliOptions.configPath, "utf8"));
    await listProducts(config, cfg);
    return;
  }

  if (!cliOptions.sample || !cliOptions.title) {
    console.log(`
Multi-Store Product Listing Engine (Zero Hardcoded Domains)

Usage:
  node scripts/store-list-product.cjs --env <path-to-.env.local> --sample "<Sample Article>" --title "<New Article>" [--price 1849] [--compare-price 2850] [--link-with id1,id2]
  node scripts/store-list-product.cjs --project-dir <path-to-repo> --sample "<Sample Article>" --title "<New Article>"
  node scripts/store-list-product.cjs --config ./listing.json
    `);
    process.exit(1);
  }

  await listProducts(config, {
    sample: cliOptions.sample,
    items: [{ title: cliOptions.title, price: cliOptions.price, compare_price: cliOptions.comparePrice }],
    linkTogether: true,
    linkWith: cliOptions.linkWith
  });
}

if (require.main === module) {
  main().catch(err => {
    console.error("❌ Error listing product:", err.message);
    process.exit(1);
  });
}

module.exports = { listProducts, resolveConfig };
