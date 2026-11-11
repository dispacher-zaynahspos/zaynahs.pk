# 11 — Supabase Storage / Image Rules

## RULE S1 — Bucket setup (run once in Supabase SQL Editor)
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Public read policy
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admin upload policy
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Admin delete policy
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

## RULE S2 — Image upload pattern
```typescript
// lib/services/storage.ts
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string> => {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  const { data } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const deleteProductImage = async (url: string): Promise<void> => {
  const path = url.split('/product-images/')[1];
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .remove([path]);
  if (error) throw error;
};
```
> Never use raw curl/direct fetch to upload — always `supabase-js` `upload(..., { upsert: true })`.
> Kabhi bhi curl/raw fetch se upload nahi karna — hamesha supabase-js `upload()` hi use karo.

## RULE S3 — Image optimization
Always use Next.js `<Image>`:
```tsx
<Image
  src={imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, 33vw"
  className="object-cover"
  priority={isAboveFold}
/>
```
Storefront display images must use `getOptimizedImageUrl()` (Supabase transform params) — see the URL-driven sort/filter pattern & performance standards in `docs/UI_PERFORMANCE_GUIDE.md` (mandatory for any admin table/list with product/image thumbnails — e.g. `TableThumbnail` click → Modal).

## RULE S4 — Smart image compressor & brand uploads
All uploads pass through `lib/utils/imageCompressor.ts`, a 3-strategy fallback chain:
1. `createImageBitmap(file)` — OS-native HEIC decoding on macOS/iOS (fastest).
2. `ObjectURL → <img> → createImageBitmap` — OS decoder via `<img>` tag (HEIC on macOS Chrome).
3. `heic2any → createImageBitmap` — pure WASM fallback for HEIC on Windows/Linux (last resort).

If all strategies fail → throw a user-visible Error (shown as toast). NEVER silently upload a broken file.
Output: `.webp`, max 1200px, target under 50KB — iterative quality + resolution reduction.
Admin panel previews use plain `<img>` tags (not `next/image`) to avoid domain-restriction errors.
`next.config.ts` must have the Supabase hostname in `images.remotePatterns` for `next/image` to work on the storefront.
Favicon, Logo, Banner: uploadable/removable in Settings; logo width adjustable via range slider. Store favicon and document titles bind dynamically via `generateMetadata()` in `app/layout.tsx`.

## RULE S5 — next.config image domains
```typescript
// next.config.ts — REQUIRED for next/image with Supabase
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'ziucrfpebpxijqhwmqre.supabase.co',
    pathname: '/storage/v1/object/public/**',
  }],
  formats: ['image/webp', 'image/avif'],
}
```

## RULE S6 — Universal media selector
- All admin image selection MUST use the shared `MediaSelectorModal` — never a direct `<input type="file">`.
- Selection buttons use the centralized `Image` icon from `@/components/common/Icons` (e.g. `import { Image as ImageIcon } from '@/components/common/Icons'`) with standardized styling.
- Direct upload inputs are forbidden on settings forms and product editors — new media must be uploaded within `MediaSelectorModal` to keep the library consistent.

## Supabase image compression (asset pipeline)
Compress stored images (WebP ≤100KB, URL-preserving): run `scripts/convert-images-webp.mjs` and follow `docs/SUPABASE_IMAGE_CONVERTER.md` (TEST_LIMIT test → full run → verify).

## Global compress-on-image UI rule (RULE 7, from Golden UI checklist)
Whenever admin table/list shows a product/image thumbnail, MUST follow `docs/UI_PERFORMANCE_GUIDE.md` (TableThumbnail click → Modal pattern, `getOptimizedImageUrl()`, URL-driven sort/filter, page-load performance standards).

## RULE S7 — Image + Load Performance (verified 2026-10)
- **Upload pipeline (SSOT)**: every image goes through `app/api/upload-image/route.ts` — Sharp → WebP, ≤50KB, max 1200px, auto EXIF-rotate + metadata strip, favicons → PNG ≤128px. Videos bypass Sharp, uploaded raw. Never add a second upload path.
- **Stored files are already optimized**, therefore `next.config.ts` keeps `images.unoptimized: true` (no paid image CDN). Do NOT flip this on without provisioning a loader — it would 404/double-serve.
- **Display**: wrap storefront image URLs with `getOptimizedImageUrl(url, width)` / `getPresetImageUrl(url, preset)` from `@/lib/utils/imageUrl` (appends width/quality params — graceful no-op on hosts without transform). Presets: `micro/admin_thumb/card/banner/zoom/hero/logo`.
- **Lists use thumbnails only** (`card`/`admin_thumb` preset), never full-size. Fixed width/height on every `<Image>` to avoid CLS. `priority` only on hero/LCP; everything below the fold lazy.
- **Canonical URL format**: `https://<ref>.supabase.co/storage/v1/object/public/product-images/<path>` — one format everywhere (storefront, admin, customizer preview, OG). Migrate legacy values in place (path-preserving) via `scripts/convert-images-webp.mjs`; never rewrite stored URLs ad-hoc.
- **Performance budgets** (storefront): LCP < 2.5s (mobile 4G), CLS < 0.1, no long tasks during scroll. Lazy-render below-the-fold sections, code-split heavy components, defer pixels/chat/tickers.

## RULE S8 — ONE shared upload experience with real visible progress
Verified 2026-10. ALL media uploads go through a single system — never a bespoke upload per screen.
- **Single path:** every upload entry point (Media page, `MediaSelectorModal` → `MediaManager` used by Products, Variants, Categories, Collections, Customizer Select Image + Bulk Add, Size Guides, Promo/Brands, Reviews) routes through `components/admin/media-manager/hooks/useMediaDragAndDropUpload.ts` → `POST /api/media/upload` → `lib/uploadImage.ts` (server Sharp WebP). No duplicate upload code.
- **Instant feedback (<100ms):** on file pick, each file appears as a tile at the START of the grid via `URL.createObjectURL` local preview (`UploadTileCard.tsx`), dimmed, with filename + size.
- **Real progress:** transfer percent comes from `XMLHttpRequest` `upload.onprogress` (built-in, no library) — never a fake timer. Stages per tile: Queued → Optimizing (WebP, shows `before → after` size on done) → Uploading N% → Saving → Done (green tick + highlight) → Tagging (if auto-tag on). Non-measurable steps use an indeterminate bar (`@keyframes indeterminate` in `globals.css`, respects `prefers-reduced-motion`).
- **Sticky panel:** `UploadProgressPanel.tsx` (bottom-right desktop / full-width mobile) — "Uploading N of M", overall bar, per-file cancel, collapsible, survives modal close; `beforeunload` guard while active.
- **Resilience:** parallel limit 2 (slow-phone safe); 8s no-progress → "Slow connection" hint; offline → fail with Retry; per-file Retry/Remove on error; one failure never blocks others; cancel via `xhr.abort()` at any stage; duplicate/invalid files handled; type+size validated before start (25MB cap).
- **Selector modal:** newly uploaded image auto-selects (single picker highlights it; multi adds to selection) so "Add Selected" is immediately usable.
- **Backward compatible:** same endpoint, WebP output, file naming, DB record, cache purge — only the client UX/progress changed. Any NEW upload UI MUST reuse `useMediaDragAndDropUpload` + `UploadTileCard` + `UploadProgressPanel`.

## RULE S9 — Edge-Cached /storage/ Delivery & Core Web Vitals Optimization (verified 2026-10)
- **Domain-Proxied Edge Delivery**: Storefront images must resolve through `/storage/...` (via `getOptimizedImageUrl` / `getPresetImageUrl`). `next.config.ts` rewrites `/storage/:path*` to Supabase public storage, and Cloudflare rule `(http.request.uri.path wildcard "/storage/*")` caches all storage images at Cloudflare Edge for 1 year with `override_origin`. Zero Vercel image units used, zero quota risk.
- **Hero LCP Preload**: Slide #1 on Hero Banner must have `fetchPriority="high"`, `decoding="sync"`, and responsive `<source>` with `'banner'` preset for mobile (<768px). Guarantees LCP < 1.8s even on throttled 4G.
- **Zero-Block Pixels**: All marketing tracking scripts in `components/Pixels.tsx` must use `strategy="lazyOnload"` (never `afterInteractive`) to prevent main-thread contention during hydration, eliminating TBT.
- **Zero-Block Fonts**: Theme font stylesheets in `ThemeStyleRegistry.tsx` must render as `<link rel="preconnect">` + `<link rel="stylesheet">`, never inline `@import url(...)` inside `<style>` blocks which halt CSSOM layout.

## RULE S10 — Dual-Architecture Storage Law & Strict S5 Supabase Storage Ban
- **Mode A (Cloudflare Workers $5 Paid Plan — Modern / Primary)**:
  - **Zero Supabase Storage**: Under the S5 plan, Supabase Storage usage is **strictly 0% (banned)**. Supabase is Postgres Database & Auth ONLY.
  - **100% Cloudflare R2**: All media files reside in Cloudflare R2 bucket (`totvogue-images`) delivered via custom edge domain (`https://img.<domain>/...`).
  - **Egress & Cost**: Zero egress fees, unlimited image delivery, zero Vercel image units.
  - **Upload Routing**: `app/api/upload-image/route.ts` and `lib/uploadImage.ts` upload directly to R2. If R2 is enabled and fails, the server throws an explicit 500 error — silent fallback to uncompressed Supabase storage is strictly forbidden.
- **Mode B (Legacy Vercel Free Mode)**:
  - Vercel Serverless + Supabase Storage `product-images` bucket. Only used when explicitly selected by the user for free-tier setups without R2.

## RULE S11 — Mandatory WebP Conversion & Zero Silent Fallback
- **Universal WebP Enforcement**: Every single uploaded image (PNG, JPEG, HEIC, WebP) must undergo server/client compression to WebP (target ≤80KB, max dimension 1600px, quality 80–85).
- **Favicons Exception**: Favicons convert to PNG ≤128px.
- **Zero Silent Fallback**: If Sharp conversion fails or image encoding encounters an error, the system must throw a clear, visible error toast instead of silently uploading uncompressed 2MB+ PNGs.

## RULE S12 — Cross-Platform Catalog Import/Export & Media Isolation (Mode A R2 ↔ Mode B Supabase Storage)
- **Zero External Hotlinks on Catalog Import**: When importing products (whether from another store on Mode A R2, Mode B Supabase, or external sources), media files (product images, variant images, category images) must **never remain hotlinked to the old store**. Every external media file must be fetched, verified/converted to WebP, uploaded into the target store's own active storage (R2 on Mode A, Supabase Storage on Mode B), and registered in `media_library` with the target store's own public URL.
- **Strict Store Ownership Verification (`isOwnStorageUrl`)**: `isOwnStorageUrl` must strictly verify ownership against the target store's configured URLs (`process.env.R2_PUBLIC_BASE`, `NEXT_PUBLIC_R2_PUBLIC_BASE`, `NEXT_PUBLIC_BRAND_DOMAIN`, or `NEXT_PUBLIC_SUPABASE_URL`). It is **strictly forbidden** to use generic substring heuristics (e.g. matching any `img.` string) which wrongly treat foreign stores' R2 media as local, preventing them from being downloaded.
- **Dual-Target Import Storage Engine (`uploadImportedMedia`)**: The catalog import pipeline in `app/api/products/import/helpers.ts` must dynamically adapt to the target store's hosting mode:
  - On **Mode A (Cloudflare Workers / R2)**: Calls `uploadObjectToR2` to save files under `product-images/...` and generates edge-cached URLs (`https://img.<domain>/...`).
  - On **Mode B (Legacy Vercel Free)**: Uploads to Supabase Storage `product-images` bucket.
  - Zero silent fallback from Mode A to Supabase Storage.
- **Media Re-use Mapping**: If multiple variants share the same source image as a product image, the import engine maps it via `uploadedUrlsMap` so the asset is downloaded and uploaded exactly once to avoid redundant network/storage overhead.

