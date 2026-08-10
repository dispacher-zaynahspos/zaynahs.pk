import { readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

const DIR = process.argv[2] || 'gen images'
const MODELS = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

const env = {}
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY missing in .env.local')
  process.exit(1)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function describeImage(filePath) {
  const ext = extname(filePath).toLowerCase().replace('.', '')
  const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
  const data = (await readFile(filePath)).toString('base64')

  for (let cycle = 1; cycle <= 10; cycle++) {
    for (const model of MODELS) {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      try {
        const res = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType, data } },
                { text: 'Look at this e-commerce product photo carefully. What is this item? Describe its material, color, shape, and product type (e.g. gold-plated-pendant-necklace, stainless-steel-skull-ring, leather-braided-keychain). Give a 3 to 6 word descriptive title in lowercase with hyphens. MUST include the item type (necklace, ring, keychain, earrings, bracelet, knife, set, etc.). Output ONLY the hyphenated text.' }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
          })
        })

        if (res.status === 429) {
          continue
        }

        if (!res.ok) {
          continue
        }

        const json = await res.json()
        const parts = json.candidates?.[0]?.content?.parts || []
        const text = parts
          .filter(p => typeof p.text === 'string')
          .map(p => p.text)
          .join(' ')
          .trim()

        const clean = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        const words = clean.split('-').filter(Boolean)

        if (words.length >= 2 && clean.length >= 8 && clean !== 'example-product') {
          return clean
        }
      } catch (err) {
        continue
      }
    }
    console.log(`  All models busy/retrying, sleeping 10s (cycle ${cycle})...`)
    await sleep(10000)
  }
  return 'product-item'
}

const mapPath = join(DIR, 'rename-map.json')
let renameMap = {}
if (existsSync(mapPath)) {
  try {
    renameMap = JSON.parse(readFileSync(mapPath, 'utf8'))
  } catch (e) {}
}

const allFiles = await readdir(DIR)
const filesToProcess = allFiles.filter(f => {
  if (f === '.DS_Store' || f === 'rename-map.json') return false
  const base = f.replace(/\.[^.]+$/, '')
  // Match original un-renamed files OR single-word generic names (e.g., fleur.png, layered.png)
  const isOriginal = /^\d+(_gen_\d+)?$/i.test(base) || /^unknown-product/i.test(base) || /^m-\d+/i.test(base)
  const isSingleWord = !base.includes('-') || base.split('-').length < 2
  return isOriginal || isSingleWord
}).sort()

console.log(`Total images to process/refine: ${filesToProcess.length}`)

const usedNames = new Set(
  allFiles
    .filter(f => f !== '.DS_Store' && f !== 'rename-map.json' && f.includes('-') && f.split('-').length >= 2)
    .map(v => v.replace(/\.[^.]+$/, ''))
)

for (let i = 0; i < filesToProcess.length; i++) {
  const file = filesToProcess[i]
  const oldPath = join(DIR, file)
  const ext = extname(file)

  try {
    const cleanName = await describeImage(oldPath)

    let targetName = cleanName
    let counter = 2
    while (usedNames.has(targetName)) {
      targetName = `${cleanName}-${counter}`
      counter++
    }
    usedNames.add(targetName)

    const newFilename = `${targetName}${ext}`
    const newPath = join(DIR, newFilename)

    await rename(oldPath, newPath)
    console.log(`[${i + 1}/${filesToProcess.length}] ${file} -> ${newFilename}`)

    renameMap[file] = newFilename
    if (i % 5 === 0) {
      await writeFile(mapPath, JSON.stringify(renameMap, null, 2))
    }
  } catch (e) {
    console.error(`[${i + 1}/${filesToProcess.length}] ERROR processing ${file}: ${e.message}`)
  }

  await sleep(300)
}

await writeFile(mapPath, JSON.stringify(renameMap, null, 2))
console.log('\n✅ Renaming completed! Mapping saved to gen images/rename-map.json')



