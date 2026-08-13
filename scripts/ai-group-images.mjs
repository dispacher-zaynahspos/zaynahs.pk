import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// We need the Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is missing from environment variables.");
  process.exit(1);
}

// Initialize SDK
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '../gen images');

// Helper for wait
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));
  
  // Sort files to have consistent ordering
  files.sort();

  console.log(`Found ${files.length} images to process. Starting 1-by-1 AI renaming...`);

  // To group them, we keep track of descriptions
  // But wait, sending 1 by 1 and asking AI to describe might result in slightly different descriptions.
  // We can ask the AI to output exactly: [GENDER]_[COLOR]_[TYPE]_[DESIGN]
  // e.g. BOYS_GREEN_TSHIRT_PAKISTAN, GIRLS_WHITE_FROCK_FLORAL
  // We will maintain a map of baseName -> count
  const baseNameCounts = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // We will analyze all files again to give them detailed names
    const filePath = path.join(IMAGES_DIR, file);
    const fileData = fs.readFileSync(filePath);
    
    console.log(`[${i+1}/${files.length}] Analyzing ${file}...`);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: fileData.toString("base64"),
                  mimeType: "image/webp"
                }
              },
              {
                text: "Look at the clothing in this image. I need a VERY detailed and unique base filename for this specific outfit so that I can perfectly group multiple shots of the EXACT SAME outfit together, but keep DIFFERENT outfits separate. Format: GENDER_COLOR_TYPE_PATTERN_UNIQUEDETAIL (e.g., WOMEN_BLACK_DRESS_FLORAL_VNECK_LACE, WOMEN_RED_KURTI_EMBROIDERED_LONG_SLEEVE, BOYS_GREEN_TSHIRT_WHITE_STRIPE). Use ONLY uppercase letters and underscores. No spaces, no special characters, no file extension. Be very specific about unique design elements to prevent mixing up two different dresses of the same color."
              }
            ]
          }
        ],
        config: {
          temperature: 0.1 // Low temperature for consistent naming
        }
      });

      let baseName = response.text.trim();
      // Clean it up just in case
      baseName = baseName.replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      
      if (!baseNameCounts[baseName]) {
        baseNameCounts[baseName] = 1;
      } else {
        baseNameCounts[baseName]++;
      }

      const newFileName = `${baseName}_${baseNameCounts[baseName]}.webp`;
      const newFilePath = path.join(IMAGES_DIR, newFileName);
      
      fs.renameSync(filePath, newFilePath);
      console.log(` ✅ Renamed to -> ${newFileName}`);
      
      // Wait to respect rate limits
      if (i < files.length - 1) {
          await delay(5000);
      }
      
    } catch (error) {
      console.error(` ❌ Error processing ${file}:`, error.message);
      // If we hit a rate limit, wait 60 seconds and retry the SAME file
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          console.log(` ⏳ Rate limit hit! Waiting 60 seconds before retrying...`);
          await delay(60000);
          i--; // Decrement i so the loop retries this file
      } else {
          // Unhandled error, just wait a bit and move on
          await delay(10000); 
      }
    }
  }

  console.log("All done!");
}

main().catch(console.error);
