import { readdir, readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const DIR = process.argv[2] || 'gen images'

const env = {}
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function formatTitle(baseName) {
  return baseName
    .split('_')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

async function ensureCategory() {
  const slug = 'womens-clothing'
  const name = "Women's Clothing"
  
  const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (existing) return existing.id

  const { data: inserted, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      active: true,
      description: `<p>Explore our exclusive collection of ${name}.</p>`,
      sort_order: 0
    })
    .select('id')
    .single()

  if (error) throw error
  return inserted.id
}

async function run() {
  console.log('🚀 Starting Supabase Upload & Product Grouping Process...')
  const categoryId = await ensureCategory()

  const allFiles = await readdir(DIR)
  const imageFiles = allFiles.filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort()

  console.log(`Found ${imageFiles.length} images. Grouping by outfit...`)

  // Group images by baseName
  // E.g., WOMEN_BLACK_DRESS_1.webp -> baseName: WOMEN_BLACK_DRESS
  const productsMap = {}
  
  for (const file of imageFiles) {
    // Remove extension
    const nameWithoutExt = file.replace(/\.[^.]+$/, '')
    // Split by last underscore
    const lastUnderscoreIndex = nameWithoutExt.lastIndexOf('_')
    
    let baseName = nameWithoutExt
    let index = 1
    
    // If it ends with _1, _2 etc, we group them
    // if (lastUnderscoreIndex !== -1) {
    //   const suffix = nameWithoutExt.substring(lastUnderscoreIndex + 1)
    //   if (!isNaN(parseInt(suffix))) {
    //     baseName = nameWithoutExt.substring(0, lastUnderscoreIndex)
    //     index = parseInt(suffix)
    //   }
    // }
    
    if (!productsMap[baseName]) {
      productsMap[baseName] = []
    }
    productsMap[baseName].push({ file, index })
  }

  const productKeys = Object.keys(productsMap)
  console.log(`Generated ${productKeys.length} unique products from ${imageFiles.length} images.\n`)

  let successCount = 0

  for (let i = 0; i < productKeys.length; i++) {
    const baseName = productKeys[i]
    const images = productsMap[baseName].sort((a, b) => a.index - b.index)
    
    const title = formatTitle(baseName)
    const baseSlug = baseName.toLowerCase().replace(/_/g, '-')
    const price = 5000 // Exact price requested by user
    const comparePrice = 7500
    
    console.log(`[${i+1}/${productKeys.length}] Processing Product: ${title} (${images.length} images)`)

    try {
      // 1. Check if product exists
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('slug', baseSlug)
        .maybeSingle()

      let productId = existingProd?.id

      const productPayload = {
        name: title,
        slug: baseSlug,
        price: price,
        compare_price: comparePrice,
        short_description: title,
        description: `<p>Premium <strong>${title}</strong> designed for elegance and style.</p><ul><li><strong>Category:</strong> Women's Clothing</li><li><strong>Delivery:</strong> Cash on Delivery (COD) across Pakistan.</li></ul>`,
        category_id: categoryId,
        stock: 20,
        is_active: true,
        is_featured: false,
        has_variants: true,
        tags: ['clothing', 'womens-fashion', 'pakistan', 'dresses', 'suits'],
        meta_title: `${title} - Zaynahs E-Store Pakistan`,
        meta_description: `Buy ${title} online in Pakistan for Rs. ${price}. Cash on delivery nationwide.`
      }

      if (productId) {
        await supabase.from('products').update({...productPayload, updated_at: new Date().toISOString()}).eq('id', productId)
      } else {
        const { data: inserted, error: insertErr } = await supabase.from('products').insert(productPayload).select('id').single()
        if (insertErr) throw insertErr
        productId = inserted.id
      }

      // 2. Upload and Link Images
      await supabase.from('product_images').delete().eq('product_id', productId)

      for (let j = 0; j < images.length; j++) {
        const imgObj = images[j]
        const file = imgObj.file
        const filePath = join(DIR, file)
        const ext = extname(file).toLowerCase().replace('.', '')
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
        const storagePath = `catalog/${file}`

        const fileData = await readFile(filePath)
        
        // Upload to storage
        const { error: uploadErr } = await supabase.storage.from('product-images').upload(storagePath, fileData, { contentType: mimeType, upsert: true })
        if (uploadErr) {
          console.error(`   -> Upload failed for ${file}:`, uploadErr.message)
          continue
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath)
        const imageUrl = urlData.publicUrl

        // Insert into product_images
        await supabase.from('product_images').insert({
          product_id: productId,
          url: imageUrl,
          is_primary: j === 0,
          sort_order: j
        })

        // Media Library
        const { data: existingMedia } = await supabase.from('media_library').select('id').eq('file_url', imageUrl).maybeSingle()
        if (!existingMedia) {
          await supabase.from('media_library').insert({
            original_filename: file,
            seo_filename: file,
            file_url: imageUrl,
            alt_text: title,
            title: title,
            description: title,
            bucket: 'product-images',
            mime_type: mimeType
          })
        }
      }

      // 3. Add Size Variations (S, M, L, XL)
      await supabase.from('product_variants').delete().eq('product_id', productId)
      
      const sizes = ['S', 'M', 'L', 'XL']
      const variantsData = sizes.map((size, idx) => ({
        product_id: productId,
        size: size,
        price: price, // same price
        compare_price: comparePrice,
        stock: 10,
        active: true,
        sort_order: idx
      }))
      
      const { error: varErr } = await supabase.from('product_variants').insert(variantsData)
      if (varErr) {
        console.error(`   -> Error adding variants for ${title}:`, varErr.message)
      }

      successCount++
      console.log(`   ✅ Successfully added product with ${images.length} images (Rs. ${price})`)
      
    } catch (err) {
      console.error(`   ❌ ERROR processing ${title}:`, err.message)
    }

    await sleep(50)
  }

  console.log(`\n🎉 DONE! Successfully listed ${successCount} clothing products on Supabase!`)
}

run().catch(console.error)
