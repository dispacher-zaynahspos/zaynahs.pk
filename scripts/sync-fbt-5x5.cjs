const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('env-backups/totvogue.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, category_id, is_active')
    .eq('is_active', true);

  if (error || !products) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} active products.`);

  const girls = [];
  const boys = [];
  const unisex = [];

  for (const p of products) {
    const text = (p.name + ' ' + (p.slug || '')).toLowerCase();
    if (text.includes('girl') || text.includes('frock') || text.includes('skirt')) {
      girls.push(p.id);
    } else if (text.includes('boy')) {
      boys.push(p.id);
    } else {
      unisex.push(p.id);
    }
  }

  console.log(`Pools: Girls=${girls.length}, Boys=${boys.length}, Unisex=${unisex.length}`);

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let updatedCount = 0;
  for (const p of products) {
    const isGirl = girls.includes(p.id);
    const isBoy = boys.includes(p.id);

    let candidatePool;
    if (isGirl) {
      candidatePool = [...girls, ...unisex].filter(id => id !== p.id);
    } else if (isBoy) {
      candidatePool = [...boys, ...unisex].filter(id => id !== p.id);
    } else {
      candidatePool = products.map(x => x.id).filter(id => id !== p.id);
    }

    const selected5 = shuffle(candidatePool).slice(0, 5);

    const { error: updateErr } = await supabase
      .from('products')
      .update({ frequently_bought_together_ids: selected5 })
      .eq('id', p.id);

    if (updateErr) {
      console.error(`Failed to update ${p.id}:`, updateErr);
    } else {
      updatedCount++;
    }
  }

  console.log(`Successfully updated frequently_bought_together_ids (5 per product) for ${updatedCount} products.`);
}

run();
