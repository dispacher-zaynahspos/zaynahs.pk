# RULE 33: Sample-Inspired Product Cloning & Dynamic Multi-Store Listing Engine

## ⛔ ZERO HARDCODED DOMAINS OR SECRETS DIRECTIVE
- **NEVER hardcode specific store domains** (e.g. `totvogue.pk`, `zaynahs.pk`, etc.) or specific database endpoints inside listing scripts or rules.
- **Dynamic Project / Store Resolution**: The listing engine must dynamically target whichever project or store the user asks for. It reads configuration and credentials from:
  1. The target project directory specified by the user or current working context (e.g. `./.env.local`, `./.env`).
  2. Command line arguments: `--project <name>`, `--env <path>`, `--site-url <url>`, `--supabase-url <url>`.
  3. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`.

---

## 1. Prime Directive for Sample Inspiration Articles
Whenever the user specifies a sample product (e.g., *"is article se inspired..."*, *"sample this article..."*, *"same iske categories etc use karo"*):

### A. Inherited / Cloned from Sample Product:
1. **Categories & Hierarchy**: Exact same categories and positions (`product_categories`, `category_id`).
2. **Size Chart**: Exact same `size_guide_id`.
3. **Variants & Sizes**: Exact same size variations (e.g. `2-3y`, `3-4y`, `4-5y`, `5-6y`, `7-8y`, `9-10y`, `11-12y`) with default `100` stock each.
4. **Variation Mode**: `variation_order = ['size']` (strictly size-only variants, NO color variants unless explicitly requested).
5. **Badges**: Same `custom_badge_id` and `badge_enabled`.
6. **Price & Compare Price**: Inherited from sample UNLESS explicitly overridden by user (e.g., "price 1549", "1749 pricee", "950 price").

### B. Unique & Real for Every New Article (NEVER Cloned):
1. **Title / Name**: Article's own specific, descriptive name (from media library or prompt).
2. **Product Description**: Dedicated high-converting HTML description highlighting the specific garment's design, motifs, fabric, and care instructions.
3. **Short Description**: Unique high-converting teaser.
4. **Tags**: Unique keywords matching the article's specific character, colors, and style.
5. **Images**: Real image from `media_library` (or provided URL), marked as `is_primary: true`.

---

## 2. Frequently Bought Together (`frequently_bought_together_ids`)
- If multiple articles are listed in a prompt as a group/collection, they MUST be mutually cross-linked in `frequently_bought_together_ids`.
- If existing products are mentioned to be part of the group (e.g., "all 6 ek category 1 vendor k hain, bought together mein all linked"), ALL existing products in the database must be updated to include the new IDs, ensuring a 100% complete mutual link across all items in the set.

---

## 3. Dynamic Execution CLI
The multi-store CLI engine is located at:
`scripts/store-list-product.cjs`

Usage examples:
```bash
# Explicit project name or env file:
node scripts/store-list-product.cjs --project totvogue --sample "<Sample Article>" --title "<New Article>" --price <SalePrice> --compare-price <ComparePrice>

# Direct env file path:
node scripts/store-list-product.cjs --env /path/to/.env.local --sample "<Sample Article>" --title "<New Article>"
```
Post-insertion, it dynamically triggers the target store's ISR `/api/revalidate` and Cloudflare purge using that project's configured secrets.
