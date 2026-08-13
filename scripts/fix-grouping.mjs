import fs from 'fs'
import path from 'path'

const IMAGES_DIR = path.join(process.cwd(), 'gen images')
const MAPPING_FILE = path.join(process.cwd(), 'task_5680_mapping.txt')

const logContent = fs.readFileSync(MAPPING_FILE, 'utf8')
const lines = logContent.split('\n')

// Map: oldBaseName -> [ { index, currentName } ]
const groups = {}

let currentOldName = ''
let currentIndex = ''
let currentOldBase = ''

for (const line of lines) {
  const analyzeMatch = line.match(/Analyzing (.*?)(?:_(\d+))?\.webp\.\.\./)
  if (analyzeMatch) {
    currentOldName = analyzeMatch[1]
    currentIndex = analyzeMatch[2] || '1'
    currentOldBase = currentOldName
  }
  
  const renamedMatch = line.match(/Renamed to -> (.*?)\.webp/)
  if (renamedMatch) {
    const currentName = renamedMatch[1] + '.webp'
    
    if (!groups[currentOldBase]) {
      groups[currentOldBase] = []
    }
    
    groups[currentOldBase].push({
      index: parseInt(currentIndex),
      currentName
    })
  }
}

let renamedCount = 0

for (const oldBaseName in groups) {
  const items = groups[oldBaseName].sort((a, b) => a.index - b.index)
  
  // Use the detailed name of the first item as the new base name for the whole group
  const firstItemName = items[0].currentName.replace(/_1\.webp$/, '')
  
  for (const item of items) {
    const oldPath = path.join(IMAGES_DIR, item.currentName)
    const newName = `${firstItemName}_${item.index}.webp`
    const newPath = path.join(IMAGES_DIR, newName)
    
    if (fs.existsSync(oldPath)) {
      if (oldPath !== newPath) {
        fs.renameSync(oldPath, newPath)
        console.log(`Grouped: ${item.currentName} -> ${newName}`)
        renamedCount++
      }
    } else {
      console.log(`Warning: File not found ${oldPath}`)
    }
  }
}

console.log(`\n✅ Successfully grouped and renamed ${renamedCount} files locally!`)
