import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to calculate cosine similarity between two strings
function getCosineSimilarity(str1, str2) {
  const getTokens = (str) => {
    return str.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 2) // ignore short words
  }

  const tokens1 = getTokens(str1)
  const tokens2 = getTokens(str2)
  
  const uniqueTokens = Array.from(new Set([...tokens1, ...tokens2]))
  
  const vec1 = uniqueTokens.map(t => tokens1.filter(w => w === t).length)
  const vec2 = uniqueTokens.map(t => tokens2.filter(w => w === t).length)
  
  let dotProduct = 0
  let mag1 = 0
  let mag2 = 0
  
  for (let i = 0; i < uniqueTokens.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    mag1 += vec1[i] * vec1[i]
    mag2 += vec2[i] * vec2[i]
  }
  
  if (mag1 === 0 || mag2 === 0) return 0
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

async function run() {
  console.log('Fetching products...')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name')
    .eq('is_active', true)
    
  if (error) {
    console.error('Error fetching products:', error)
    return
  }
  
  console.log(`Found ${products.length} products. Grouping by similarity...`)
  
  const SIMILARITY_THRESHOLD = 0.55 // Adjust if needed
  
  const groups = []
  const assigned = new Set()
  
  for (let i = 0; i < products.length; i++) {
    if (assigned.has(products[i].id)) continue
    
    const group = [products[i]]
    assigned.add(products[i].id)
    
    for (let j = i + 1; j < products.length; j++) {
      if (assigned.has(products[j].id)) continue
      
      const similarity = getCosineSimilarity(products[i].name, products[j].name)
      
      if (similarity >= SIMILARITY_THRESHOLD) {
        group.push(products[j])
        assigned.add(products[j].id)
      }
    }
    
    groups.push(group)
  }
  
  console.log(`Grouped into ${groups.length} unique items.`)
  
  for (const group of groups) {
    if (group.length > 1) {
      console.log(`\nGroup:`)
      for (const item of group) {
        console.log(` - ${item.name}`)
      }
      
      // The first item is the MAIN item
      const mainProduct = group[0]
      
      let nextSortOrder = 1 // Assuming main product has image at sort_order 0
      
      for (let i = 1; i < group.length; i++) {
        const duplicateProduct = group[i]
        
        // 1. Move images to main product
        const { data: images } = await supabase.from('product_images').select('*').eq('product_id', duplicateProduct.id)
        if (images && images.length > 0) {
          for (const img of images) {
            await supabase.from('product_images').update({ 
              product_id: mainProduct.id,
              is_primary: false,
              sort_order: nextSortOrder++
            }).eq('id', img.id)
          }
        }
        
        // 2. Delete the duplicate product (cascade will delete its variants)
        await supabase.from('products').delete().eq('id', duplicateProduct.id)
      }
      console.log(`✅ Merged into ${mainProduct.name}`)
    }
  }
  
  console.log('\nAll done! Duplicates merged.')
}

run().catch(console.error)
