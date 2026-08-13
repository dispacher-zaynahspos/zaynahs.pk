import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching all products and variants...');
  
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, product_variants(*)');
    
  if (productError) {
    console.error('Error fetching products:', productError);
    process.exit(1);
  }

  let addedCount = 0;

  for (const product of products) {
    const variants = product.product_variants;
    
    if (!variants || variants.length === 0) continue;

    // Check if it's a clothing item (has S, M, or L)
    const hasS = variants.some(v => v.size === 'S');
    const hasM = variants.some(v => v.size === 'M');
    const hasL = variants.some(v => v.size === 'L');
    
    if (hasS || hasM || hasL) {
      // Find an existing variant to copy price/stock from
      const baseVariant = variants.find(v => v.size === 'S' || v.size === 'M' || v.size === 'L');
      
      const hasXS = variants.some(v => v.size === 'XS');
      const hasXL = variants.some(v => v.size === 'XL');
      
      const newVariants = [];
      
      if (!hasXS) {
        newVariants.push({
          product_id: product.id,
          size: 'XS',
          price: baseVariant.price,
          compare_price: baseVariant.compare_price,
          stock: baseVariant.stock || 10,
          color: baseVariant.color,
          active: true,
          sort_order: -1 // Will update sort orders later
        });
      }
      
      if (!hasXL) {
        newVariants.push({
          product_id: product.id,
          size: 'XL',
          price: baseVariant.price,
          compare_price: baseVariant.compare_price,
          stock: baseVariant.stock || 10,
          color: baseVariant.color,
          active: true,
          sort_order: 4
        });
      }
      
      if (newVariants.length > 0) {
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(newVariants);
          
        if (insertError) {
          console.error(`Error inserting XS/XL for product ${product.id}:`, insertError);
        } else {
          console.log(`Added XS/XL for product: ${product.name}`);
          addedCount += newVariants.length;
        }
      }
      
      // Update sort orders to be consistent: XS: 0, S: 1, M: 2, L: 3, XL: 4
      const { data: updatedVariants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);
        
      if (updatedVariants) {
        for (const v of updatedVariants) {
          let newSortOrder = v.sort_order;
          if (v.size === 'XS') newSortOrder = 0;
          if (v.size === 'S') newSortOrder = 1;
          if (v.size === 'M') newSortOrder = 2;
          if (v.size === 'L') newSortOrder = 3;
          if (v.size === 'XL') newSortOrder = 4;
          
          if (newSortOrder !== v.sort_order) {
            await supabase
              .from('product_variants')
              .update({ sort_order: newSortOrder })
              .eq('id', v.id);
          }
        }
      }
    }
  }

  console.log(`Done! Added ${addedCount} new XS/XL variants.`);
}

run().catch(console.error);
