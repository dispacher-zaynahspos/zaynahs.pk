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
