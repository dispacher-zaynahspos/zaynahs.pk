import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Starting jewelry revert...')

  // Get all products that are NOT women's clothing
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .neq('category_id', '03c23fa8-6bb5-40ea-bf64-f3da1ee7dbaa') // Exclude women's clothing
    
  console.log(`Found ${products.length} non-clothing products to check.`)

  for (const product of products) {
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })

    if (images && images.length > 1) {
      console.log(`\nReverting grouped product: ${product.name} (${images.length} images)`)
      
      // Get variants to copy
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        
      for (let i = 1; i < images.length; i++) {
        const img = images[i]
        
        // Find original title
        const { data: media } = await supabase
          .from('media_library')
          .select('title')
          .eq('file_url', img.url)
          .maybeSingle()
          
        const originalTitle = media?.title || `${product.name} Variant ${i}`
        const slug = originalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
        
        console.log(` -> Recreating: ${originalTitle}`)
        
        // 1. Create new product
        const productPayload = { ...product }
        delete productPayload.id
        delete productPayload.created_at
        delete productPayload.updated_at
        productPayload.name = originalTitle
        productPayload.slug = slug
        productPayload.short_description = originalTitle
        productPayload.meta_title = `${originalTitle} - Zaynahs E-Store Pakistan`
        productPayload.meta_description = `Buy ${originalTitle} online in Pakistan. Cash on delivery nationwide.`
        
        const { data: newProduct, error: insertErr } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single()
          
        if (insertErr) {
          console.error('Error recreating product:', insertErr)
          continue
        }
        
        // 2. Move image
        await supabase
          .from('product_images')
          .update({
            product_id: newProduct.id,
            is_primary: true,
            sort_order: 0
          })
          .eq('id', img.id)
          
        // 3. Copy variants
        if (variants && variants.length > 0) {
          const newVariants = variants.map(v => {
            const nv = { ...v }
            delete nv.id
            delete nv.created_at
            delete nv.updated_at
            nv.product_id = newProduct.id
            return nv
          })
          await supabase.from('product_variants').insert(newVariants)
        }
      }
    }
  }
  
  console.log('\n✅ Jewelry revert complete!')
}

run().catch(console.error)
