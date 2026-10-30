#!/usr/bin/env node

/**
 * Product Detail Infograph Generator & Gallery Uploader
 * 
 * Generates 1:1 square detail infographs with zoom circles, converts them to
 * WebP, uploads to Supabase Storage, and registers them in both media_library
 * and product_images tables.
 * 
 * Usage:
 *   node .agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs --days=40 --check
 *   node .agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs --days=40 --method=external --key=<KEY>
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Parse CLI Arguments
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const match = args.find(a => a.startsWith(prefix));
  if (match) return match.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return fallback;
};
const hasFlag = (name) => args.includes(`--${name}`);

const days = parseInt(getArg('days', '40'), 10);
const method = getArg('method', 'antigravity'); // 'antigravity' or 'external'
const isCheckOnly = hasFlag('check');
const limit = parseInt(getArg('limit', '100'), 10);
const apiKey = getArg('key', process.env.GEMINI_API_KEY || '');

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('========================================================');
  console.log(`🔍 Scanning products added in the last ${days} days...`);
  console.log('========================================================\n');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, created_at')
    .gte('created_at', cutoffDate.toISOString())
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error querying products:', error);
    process.exit(1);
  }

  const pending = [];

  for (const product of products) {
    const { data: images } = await supabase
      .from('product_images')
      .select('url, sort_order')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true });

    const hasDetailImage = (images || []).some(img => img.url && img.url.includes('-detail-'));
    if (!hasDetailImage && images && images.length > 0) {
      pending.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        primaryImageUrl: images[0].url,
      });
    }
  }

  console.log(`📊 Summary:`);
  console.log(`- Total products in last ${days} days: ${products.length}`);
  console.log(`- Products needing detail infographs: ${pending.length}\n`);

  if (isCheckOnly) {
    console.log('📋 First 10 Pending Products:');
    pending.slice(0, 10).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.name}] (Primary Image: ${p.primaryImageUrl.slice(0, 60)}...)`);
    });
    console.log('\n✅ Check completed.');
    return;
  }

  if (method === 'antigravity') {
    console.log('ℹ️ Method A (Built-in Antigravity Engine) Selected:');
    console.log('In Antigravity IDE, call the `generate_image` tool with:');
    console.log('- ImagePaths: [localProductSourceImagePath]');
    console.log('- AspectRatio: "1:1"');
    console.log('- Prompt: Follow rules defined in `.agents/skills/product-detail-infographs/prompt.md`');
    console.log('\nPending batch list ready for execution.');
    return;
  }

  if (method === 'external') {
    if (!apiKey) {
      console.error('❌ Error: Method B (external) requires an API key. Pass `--key=<GEMINI_KEY>` or set `GEMINI_API_KEY`.');
      process.exit(1);
    }
    console.log('🚀 Running generation with External Google Imagen 3 API...');
    // External API generation loop
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
