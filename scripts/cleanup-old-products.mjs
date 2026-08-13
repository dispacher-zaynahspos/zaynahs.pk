import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: category } = await supabase.from('categories').select('id').eq('slug', 'womens-clothing').single()
  if (!category) {
    console.log('Category not found')
    return
  }
  
  // Find all products in this category
  const { data: products } = await supabase.from('products').select('id, slug').eq('category_id', category.id)
  
  let deletedCount = 0
  for (const p of products) {
    // Only delete products that DO NOT end with -1 or -2
    if (!p.slug.match(/-\d+$/)) {
      await supabase.from('products').delete().eq('id', p.id)
      deletedCount++
    }
  }
  
  console.log(`Cleaned up ${deletedCount} old products without suffix.`)
}

run()
