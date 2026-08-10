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

const CATEGORY_RULES = [
  // Keychains (Exact Rs. 880 as requested by user)
  { keyword: 'keychain', name: 'Keychains & Tools', slug: 'keychains-tools', basePrice: 880, comparePrice: 1250, tags: ['keychain', 'accessories', 'metal-keychain', 'mens-accessories'] },
  { keyword: 'knife', name: 'Keychains & Tools', slug: 'keychains-tools', basePrice: 880, comparePrice: 1250, tags: ['tool', 'pocket-knife', 'keychain'] },

  // Earrings (Check before 'ring' so 'earrings' doesn't match 'ring')
  { keyword: 'earring', name: 'Earrings', slug: 'earrings', basePrice: 690, comparePrice: 1190, tags: ['earrings', 'hoop-earrings', 'jewellery'] },
  { keyword: 'hoop', name: 'Earrings', slug: 'earrings', basePrice: 650, comparePrice: 1090, tags: ['hoop-earrings', 'earrings', 'jewellery'] },
  { keyword: 'jhumka', name: 'Earrings', slug: 'earrings', basePrice: 790, comparePrice: 1290, tags: ['jhumka', 'traditional-earrings', 'jewellery'] },
  { keyword: 'stud', name: 'Earrings', slug: 'earrings', basePrice: 650, comparePrice: 1090, tags: ['studs', 'earrings', 'jewellery'] },

  // Necklaces & Pendants
  { keyword: 'necklace', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', basePrice: 1090, comparePrice: 1750, tags: ['necklace', 'pendant', 'chain', 'jewellery'] },
  { keyword: 'pendant', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', basePrice: 990, comparePrice: 1650, tags: ['pendant', 'necklace', 'jewellery'] },
  { keyword: 'choker', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', basePrice: 1190, comparePrice: 1850, tags: ['choker', 'necklace', 'fashion-jewellery'] },
  { keyword: 'chain', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', basePrice: 990, comparePrice: 1550, tags: ['chain', 'necklace', 'jewellery'] },
  { keyword: 'dog-tag', name: 'Necklaces & Pendants', slug: 'necklaces-pendants', basePrice: 890, comparePrice: 1450, tags: ['dog-tag', 'necklace', 'pendant'] },

  // Bracelets & Bangles
  { keyword: 'bracelet', name: 'Bracelets & Bangles', slug: 'bracelets-bangles', basePrice: 890, comparePrice: 1450, tags: ['bracelet', 'bangle', 'jewellery'] },
  { keyword: 'bangle', name: 'Bracelets & Bangles', slug: 'bracelets-bangles', basePrice: 990, comparePrice: 1550, tags: ['bangle', 'bracelet', 'jewellery'] },
  { keyword: 'cuff', name: 'Bracelets & Bangles', slug: 'bracelets-bangles', basePrice: 850, comparePrice: 1390, tags: ['cuff', 'bracelet', 'jewellery'] },

  // Jewelry Sets
  { keyword: 'set', name: 'Jewelry Sets', slug: 'jewelry-sets', basePrice: 1690, comparePrice: 2650, tags: ['jewelry-set', 'bridal-set', 'necklace-earrings-set'] },

  // Rings & Bands
  { keyword: 'ring', name: 'Rings', slug: 'rings', basePrice: 790, comparePrice: 1350, tags: ['ring', 'jewellery', 'stainless-steel-ring', 'fashion-ring'] },
  { keyword: 'band', name: 'Rings', slug: 'rings', basePrice: 790, comparePrice: 1350, tags: ['ring', 'band', 'wedding-band', 'jewellery'] },
]

function getCategoryAndPricing(filename) {
  const lower = filename.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (lower.includes(rule.keyword)) {
      return rule
    }
  }
  return { name: 'Fashion Accessories', slug: 'accessories', basePrice: 690, comparePrice: 1190, tags: ['accessories', 'fashion', 'jewellery'] }
}

function formatTitle(slug) {
  return slug
    .replace(/\.[^.]+$/, '')
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function generateDescription(title, catName) {
  return `<p>Add a touch of elegance to your look with the <strong>${title}</strong>. Meticulously designed for trendsetters in Pakistan, featuring premium durability, tarnish-resistant coating, and smooth polished finish.</p>
<ul>
  <li><strong>Category:</strong> ${catName}</li>
  <li><strong>Material:</strong> Premium Alloy / Stainless Steel</li>
  <li><strong>Plating:</strong> Long-lasting Anti-Fade Finish</li>
  <li><strong>Delivery:</strong> Express Cash on Delivery (COD) available across Pakistan (2-4 days).</li>
</ul>`
}

async function ensureCategoriesExist() {
  const categoryMap = {}
  
  const { data: existing, error } = await supabase.from('categories').select('id, name, slug')
  if (error) throw error

  for (const c of existing || []) {
    categoryMap[c.slug] = c.id
  }

  const allRules = [
    ...CATEGORY_RULES,
    { name: 'Fashion Accessories', slug: 'accessories' }
  ]

  for (const rule of allRules) {
    if (!categoryMap[rule.slug]) {
      console.log(`Creating category: ${rule.name} (${rule.slug})`)
      const { data: inserted, error: insErr } = await supabase
        .from('categories')
        .insert({
          name: rule.name,
          slug: rule.slug,
          active: true,
          description: `<p>Explore our exclusive collection of ${rule.name}. Affordable prices and cash on delivery in Pakistan.</p>`,
          sort_order: 0
        })
        .select()
        .single()

      if (insErr) {
        console.error(`Failed to create category ${rule.name}:`, insErr.message)
      } else if (inserted) {
        categoryMap[rule.slug] = inserted.id
      }
    }
  }

  return categoryMap
}

async function run() {
  console.log('🚀 Starting Supabase Upload & Product Listing Process...')
  const categoryMap = await ensureCategoriesExist()

  const allFiles = await readdir(DIR)
  const imageFiles = allFiles.filter(f => {
    if (f === '.DS_Store' || f === 'rename-map.json') return false
    return /\.(png|jpe?g|webp)$/i.test(f) && f.includes('-') && f.split('-').length >= 2
  }).sort()

  console.log(`Found ${imageFiles.length} real named images ready for upload & store listing.\n`)

  let successCount = 0

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]
    const filePath = join(DIR, file)
    const ext = extname(file).toLowerCase().replace('.', '')
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
    const storagePath = `catalog/${file}`

    try {
      const fileData = await readFile(filePath)
      
      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(storagePath, fileData, {
          contentType: mimeType,
          upsert: true
        })

      if (uploadErr) {
        console.error(`[${i + 1}/${imageFiles.length}] Storage Upload Failed for ${file}:`, uploadErr.message)
        continue
      }

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(storagePath)

      const imageUrl = urlData.publicUrl

      const catRule = getCategoryAndPricing(file)
      const categoryId = categoryMap[catRule.slug] || categoryMap['accessories']
      const title = formatTitle(file)
      const baseSlug = file.replace(/\.[^.]+$/, '')
      const description = generateDescription(title, catRule.name)

      const isFeatured = Math.random() < 0.2

      // Check if product with this slug already exists
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('slug', baseSlug)
        .maybeSingle()

      let productId = existingProd?.id

      const productPayload = {
        name: title,
        slug: baseSlug,
        price: catRule.basePrice,
        compare_price: catRule.comparePrice,
        short_description: title,
        description,
        category_id: categoryId,
        stock: 25,
        is_active: true,
        is_featured: isFeatured,
        has_variants: false,
        tags: catRule.tags || ['jewellery', 'fashion', 'pakistan'],
        meta_title: `${title} - Zaynahs E-Store Pakistan`,
        meta_description: `Buy ${title} online in Pakistan at best price Rs. ${catRule.basePrice}. Cash on delivery nationwide.`
      }

      if (productId) {
        // Update product
        const { error: updateErr } = await supabase
          .from('products')
          .update({
            ...productPayload,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)

        if (updateErr) console.error(`Product Update error ${title}:`, updateErr.message)
      } else {
        // Insert product
        const { data: inserted, error: insertErr } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single()

        if (insertErr) {
          console.error(`Product Insert error ${title}:`, insertErr.message)
          continue
        }
        productId = inserted.id
      }

      // Refresh product_images row
      if (productId) {
        await supabase.from('product_images').delete().eq('product_id', productId)

        const { error: imgErr } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: imageUrl,
            is_primary: true,
            sort_order: 0
          })

        if (imgErr) console.error(`Product image insert error for ${title}:`, imgErr.message)
      }

      // Ensure entry in media_library for Admin Media Manager (/admin/media)
      const { data: existingMedia } = await supabase
        .from('media_library')
        .select('id')
        .eq('file_url', imageUrl)
        .maybeSingle()

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

      successCount++
      console.log(`[${i + 1}/${imageFiles.length}] ✅ Listed & Synced to Media: "${title}" | Rs. ${catRule.basePrice} | Cat: ${catRule.name}`)

    } catch (err) {
      console.error(`[${i + 1}/${imageFiles.length}] ERROR processing ${file}:`, err.message)
    }

    await sleep(50)
  }

  console.log(`\n🎉 DONE! Successfully listed ${successCount} products & media items on Supabase!`)
}

run().catch(console.error)
