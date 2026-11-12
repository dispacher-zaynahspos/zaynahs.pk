# 33 — RULE LISTING-REUSE & Sample-Inspired Product Listing Engine (STRICT)

> Hard architectural rule. Enforces reuse of the single universal product listing engine across all stores and strictly forbids creating ad-hoc throwaway scripts.

---

## ⛔ RULE LISTING-REUSE — Zero New Throwaway Scripts (MANDATORY)

1. **Strict Prohibition on New Script Files**:
   - Whenever the user asks to list products (e.g., *"2 new images upload huwe hain lga do"*, *"1699 wali range boys me add karo"*), NEVER write a new standalone script file (e.g., `scripts/list-xxx.mjs`, `scripts/attach-xxx.mjs`, `scripts/update-xxx.mjs`).
   - Creating temporary scripts pollutes the repository, wastes tokens, and violates the Single Source of Truth (SSOT1) principle.

2. **The ONLY Canonical Listing Engine**:
   - All product listing, sample-inspired cloning, and multi-article onboarding MUST REUSE:
     ```bash
     scripts/store-list-product.cjs
     ```
   - This script is the universal, multi-store engine. It dynamically resolves store credentials, database endpoints, categories, size charts, badges, and variants.

3. **How to Run the Canonical Engine**:
   - **Single Article Listing**:
     ```bash
     node scripts/store-list-product.cjs \
       --env env-backups/<store>.env.local \
       --sample "<Sample Product Name>" \
       --title "<New Product Title>" \
       --price <Price> \
       --compare-price <ComparePrice>
     ```
   - **Bulk / Multi-Article Listing**:
     Pass `--config <json-path>` or pass dynamic options to `store-list-product.cjs`.
   - **Inline Node Operations**:
     If a direct DB calculation, soft-delete, or audit is required, run it directly via inline terminal command:
     ```bash
     node -e "..."
     ```
     NEVER save a temporary `.mjs` file into `scripts/` or the workspace.

---

## 🧬 Sample-Inspired Listing Architecture

Whenever the merchant specifies a sample product (e.g., *"is sample article ko follow karo"*):

### A. Inherited / Cloned from Sample Product:
1. **Categories & Hierarchy**: Exact same categories and positions (`product_categories`, `category_id`).
2. **Size Chart**: Exact same `size_guide_id` (e.g., `TotVogue Kids Size Guide`).
3. **Variants & Sizes**: Exact same size variations (e.g. `12-18m`, `1-2y`, `2-3y`, `3-4y`, `5-6y`) with standard `100` stock per variant.
4. **Variation Order**: `variation_order = ['Size']` (strictly size-only variants, NO color variations unless explicitly requested).
5. **Badges**: Same `custom_badge_id` and `badge_enabled`.
6. **Price & Compare Price**: Cloned from sample unless explicitly overridden by user (e.g., *"1699 wali range"*, *"price 1249"*).

### B. Gallery Order Invariant (Size Chart is ALWAYS LAST):
1. **Slot 1 (Primary)**: The article's main photo (`is_primary: true`).
2. **Slots 2 .. N-1**: Real angles, model photos, detail close-up callouts, and flat lays.
3. **Slot N (LAST SLIDE)**: The Size Measurement Guide image (`photo-2026-11-01-09-46-43-1793508433015.webp` with alt: "Detailed kids clothing size chart from TotVogue.pk showing measurements in inches for shirts, trousers, shoulders, sleeves, chest, and waist for ages 1 to 12 years."). The size chart MUST ALWAYS be positioned at the very last slide of the gallery.

### C. Unique Content for Every Article (Never Cloned):
1. **Title / Name**: Dedicated, descriptive title matching garment motifs, colors, and characters.
2. **Product Description**: High-converting HTML description highlighting specific fabric, design, and care features.
3. **Short Description**: Concise summary teaser.
4. **Tags**: Specific style and motif keywords.

---

## 🔗 Frequently Bought Together (`frequently_bought_together_ids`)

1. **Gender Isolation**:
   - Girls products MUST be paired with other Girls products.
   - Boys products MUST be paired with other Boys products.
2. **Count**:
   - 4 to 5 products randomly assigned from the matching gender pool.
3. **Mutual Cross-Linking**:
   - When a new set of products is listed, they must be cross-linked with each other and active catalog items of the same gender.

---

## 🌐 Dynamic Multi-Store & Zero Hardcoded Domains

- **Never hardcode store URLs**: All scripts and operations must discover URLs, keys, and zone IDs dynamically from:
  - Command line flag: `--env <path-to-.env.local>`
  - Environment variables: `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`.
- **Always trigger Edge Invalidation & CDN Purge on write**:
  - Revalidate Next.js ISR edge via `/api/revalidate` with `x-revalidate-secret`.
  - Purge Cloudflare cache via Cloudflare API.
