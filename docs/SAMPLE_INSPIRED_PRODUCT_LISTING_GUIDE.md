# Sample-Inspired Product Listing & Dynamic Multi-Store Engine Guide

This document defines the automated operational workflow for listing products across stores using **Sample Inspiration Articles**.

---

## 1. Core Principle: What "Inspired Sample" Means

Whenever the merchant or user specifies a sample product (e.g., *"is article se inspired sample dunga..."* or *"sample this article..."*):

### A. Inherited / Cloned from Sample Product:
1. **Categories & Hierarchy**: Exact same categories and positions (`product_categories`, `category_id`).
2. **Size Chart**: Exact same `size_guide_id`.
3. **Variants & Sizes**: Exact same size variations (e.g. `2-3y`, `3-4y`, `4-5y`, `5-6y`, `7-8y`, `9-10y`, `11-12y`) with default `100` stock per variant.
4. **Variation Order**: `variation_order = ['size']` (strictly size-only variants, NO color variations unless explicitly requested).
5. **Badges**: Same `custom_badge_id` and `badge_enabled`.
6. **Price & Compare Price**: Cloned from sample unless explicitly overridden (e.g., *"price 1549"*, *"1749 pricee"*, *"950 price"*).

### B. Unique & Real for Every New Article (NEVER Cloned):
1. **Title / Name**: The article's own specific, descriptive name (from media library or prompt).
2. **Product Description**: Dedicated high-converting HTML description highlighting the specific garment's design, motifs, fabric, and care instructions.
3. **Short Description**: Unique high-converting teaser.
4. **Tags**: Unique keywords matching the article's specific character, colors, and style.
5. **Images**: Real image from `media_library` (or provided URL), marked as `is_primary: true`.

---

## 2. Zero Hardcoded Domains & Dynamic Project Resolution

- **Absolute Prohibition**: Never hardcode specific store domains or database endpoints inside scripts.
- **Dynamic Configuration**: The script dynamically discovers the database endpoint, service role key, site URL, and revalidation secrets from:
  - Command line flag: `--env <path-to-.env.local>`
  - Project directory: `--project-dir <path>`
  - Project environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`).

---

## 3. Frequently Bought Together (`frequently_bought_together_ids`)

- **Set / Collection Linking**: When multiple articles are listed together (e.g., 4 Dior sets or 2 Cartoon sets), all articles in that collection are mutually linked in `frequently_bought_together_ids`.
- **Existing Product Set Extension**: If new articles belong to an existing collection (e.g., 2 new Girls sets joining 4 existing Girls sets = 6 total), ALL existing products in the database are updated via API to include the new product IDs, creating a complete mutual 6-item link.

---

## 4. 1-Command CLI Execution

The unified CLI engine is located at `scripts/store-list-product.cjs`.

### Single Article Listing:
```bash
node scripts/store-list-product.cjs \
  --project-dir /path/to/store/repo \
  --sample "Ligt Grey 'KING' Hoodie & Cargo Sweatpants Tracksuit Set" \
  --title "Beige and Black Christian Dior Inspired Loungewear Set" \
  --price 1849 \
  --compare-price 2850
```

### Bulk Set Listing with JSON Config:
```bash
node scripts/store-list-product.cjs \
  --env /path/to/.env.local \
  --config ./bulk-listing.json
```

### Automation Lifecycle:
1. Fetch template sample product metadata & categories from Supabase.
2. Resolve images & AI descriptions from `media_library`.
3. Batch insert `products`, `product_variants`, `product_images`, and `product_categories`.
4. Update cross-linked products (`frequently_bought_together_ids`).
5. Trigger Next.js ISR revalidation (`/api/revalidate`) and Cloudflare CDN purge.
6. Execution completes in under **3 seconds**.
