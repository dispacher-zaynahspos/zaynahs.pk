const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .eq('slug', 'blue-kurtis-batik-tie-dye-panels-red-piping-wide-cuffs-1')
      .is('deleted_at', null)
      .eq('is_active', true)
      .maybeSingle();

  // Test mapProduct logic manually
  if (!data) return console.log("NO DATA");
  console.log("Got data, mapping...");
  try {
     const price = data.price ? parseFloat(data.price) : 0;
     console.log("Price mapped:", price);
  } catch (e) {
     console.log("Mapping error:", e);
  }
}
run();
