import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSizes() {
  console.log('Fixing sizes...')
  
  await supabase.from('product_variants').update({ size: 'S' }).eq('size', 'Small')
  await supabase.from('product_variants').update({ size: 'M' }).eq('size', 'Medium')
  await supabase.from('product_variants').update({ size: 'L' }).eq('size', 'Large')
  await supabase.from('product_variants').update({ size: 'XL' }).eq('size', 'Extra Large')
  
  console.log('Done fixing sizes!')
}

fixSizes().catch(console.error)
