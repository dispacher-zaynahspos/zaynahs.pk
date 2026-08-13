# 🤖 Gemini Agent Automation Guide: Renaming & Listing Products

This guide provides complete instructions for AI agents on how to autonomously rename generated images, assign appropriate e-commerce titles, and bulk-upload them into the Supabase database using Google's Gemini APIs (like `gemini-1.5-flash-latest`, `gemini-2.5-flash`, or `gemini-2.0-flash-lite`).

## 1. Prerequisites
- **API Key**: The agent MUST use the `GEMINI_API_KEY` from `.env.local` or the system environment variables. It's a free API key provided by Google AI Studio.
- **Node.js Scripts**: All automation logic is contained within the `/scripts` directory. The AI agent MUST run these scripts locally (via `node`) when requested to rename or upload products.

## 2. Step-by-Step Workflow

### Phase 1: Renaming Images (`scripts/rename-gen-images.mjs`)
When raw images are generated (e.g., `1_gen_1.png`), they need descriptive e-commerce filenames. 
The script uses Gemini's vision capabilities to analyze the image content and generate a SEO-friendly name (e.g., `gold-plated-pendant-necklace.png`).

**How to run it:**
```bash
node scripts/rename-gen-images.mjs "path/to/folder"
```
*Note: If no folder is provided, it defaults to `gen images` in the root directory.*

**Agent Rules for Renaming:**
1. The script automatically handles Rate Limits (429) and retries across multiple models.
2. The agent should verify that `GEMINI_API_KEY` exists in `.env.local` before running the command.
3. The script renames the physical files on the disk directly. Do not interrupt the script until it completes.

### Phase 2: Listing & Uploading Products (`scripts/upload-and-list-products.mjs`)
Once the images are properly renamed (e.g., `stainless-steel-skull-ring.png`), the next step is to upload them to Supabase Storage and create product entries in the `products` table.

**How to run it:**
```bash
node scripts/upload-and-list-products.mjs "path/to/renamed-folder"
```

**Agent Rules for Listing Products:**
1. The script requires both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
2. It parses the filename to generate a readable Title (e.g., "Stainless Steel Skull Ring") and a URL-friendly Slug (`stainless-steel-skull-ring`).
3. It automatically assigns the correct **Category**, **Price**, and **Tags** based on keyword matching defined in the `CATEGORY_RULES` array inside the script. 
4. The image is automatically uploaded to the `product-images` Supabase bucket as a WebP image, and the public URL is saved in the `product_images` table.

## 3. Extending the System (For Agents)

If a user requests a **new product category** to be uploaded (e.g., "Wallets" or "Watches"):
1. The agent MUST open `scripts/upload-and-list-products.mjs`.
2. Locate the `CATEGORY_RULES` array.
3. Append a new rule object following this structure:
   ```javascript
   { keyword: 'wallet', name: 'Accessories', slug: 'accessories', basePrice: 1500, comparePrice: 2000, tags: ['wallet', 'leather'] }
   ```
4. Run the upload script.

## 4. Summary of Required Scripts
- [`scripts/rename-gen-images.mjs`](file:///Users/shoaib/Desktop/zaynahsestore-tv-main/scripts/rename-gen-images.mjs): Uses Gemini Vision API to convert arbitrary filenames into descriptive titles based on the image pixels.
- [`scripts/upload-and-list-products.mjs`](file:///Users/shoaib/Desktop/zaynahsestore-tv-main/scripts/upload-and-list-products.mjs): Bulk uploads physical image files to Supabase, generates SEO titles, matches categories by keyword, and creates DB rows.
- [`scripts/ai-group-images.mjs`](file:///Users/shoaib/Desktop/zaynahsestore-tv-main/scripts/ai-group-images.mjs): (Optional) Groups multiple variations of the same product into a single folder for multi-image product listings.

> **CRITICAL RULE FOR AI AGENTS**: Never skip these scripts when asked to "upload a batch of images". The user expects the AI to execute these Node scripts directly in the terminal, completely autonomously, using the Gemini Free API key.
