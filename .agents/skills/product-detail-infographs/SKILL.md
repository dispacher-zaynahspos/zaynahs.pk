---
name: product-detail-infographs
description: "Use when generating 1:1 macro detail infographs with zoom circles for products, WebP conversion, media_library registration, and gallery linking. Covers both Method A (Antigravity built-in engine) and Method B (External Google Imagen 3 API)."
metadata:
  version: "1.0.0"
---

# Product Detail Infograph Generation Skill

This skill defines the operational workflow for generating 1:1 macro detail breakdown infographs with zoom circles for garments, converting them to optimized WebP, uploading to Supabase Storage, and linking them to both the Media Library and Product Galleries.

---

## ⛔ MANDATORY INTAKE QUESTION (Ask User Before Starting)

Whenever the user asks to generate detail images / infographs for products, the agent **MUST ALWAYS ASK** the user which engine to use:

> *"Which generation method do you want to use?*
> 1. *(Recommended)* **Method A: Built-in Antigravity Engine** — 100% free, reference-locked, zero external billing, uses native DeepMind vision + generation.
> 2. **Method B: External API (Google Imagen 3 / Gemini)** — Uses external Google Cloud API key with billing enabled."

---

## 1. Visual & Prompt Rules (`prompt.md`)

```
+--------------------------------------------+
| (C1)                            (C5)       |
|                                            |
|        +--------+  +----------+            |
| ( C2 ) |  TOP   |  | BOTTOM   |            |
| (BIG ) | PIECE  |  | PIECE    |            |
|        +--------+  |          |            |
| ( C3 )             +----------+   ( C4 )   |
+--------------------------------------------+
```

1. **HERO**: Full garment centered (or center-right for sets), approx 50% of canvas width. Top piece left, bottom piece right, side by side, real-life proportion (not shrunk). Single piece: centered. Soft floor shadow.
2. **CIRCLES**: 2 to 5 round zoom circles with a thick clean white ring in outer margins. Never touch or cover the garment. Sizes vary, one is large.
3. **COUNT**: Plain garment = 2 circles, moderate = 3, rich = 4, rich 2-piece set = 5. Every piece gets at least one circle showing real details.
4. **PIECE LOCK**: Left circles = top piece only. Right circles = bottom piece only. A circle's dot must sit on the exact same piece the circle shows.
5. **DOT AND LINE**: One dot on the exact detail in the hero. One perfectly straight thin white line from the dot to the outer edge of the circle ring, ending cleanly there. No bends, no second lines, no second dots. Nothing drawn inside any circle. The line never crosses another piece.
6. **PRINT CIRCLES**: Show the complete print, centered with margin. Never cut a print or letters in half. Plain fabric circles can fill the circle edge to edge.
7. **NO LABELS**: Never zoom on neck tags, woven labels, or logo patches.
8. **BACKGROUND**: Smooth visible gradient in the garment's own color family: pale soft glow in the center flowing to a deeper muted shade at the bottom and corners. Always less saturated than the garment, never neon, never the same shade. The garment must stand out. The background never tints the garment.
9. **REALISM**: Real photo, 100mm macro look, soft studio light. Visible real fabric weave/knit, stitch thread, natural folds. No plastic, CGI, glow, or over-smooth look.
10. **FIDELITY**: Colors, prints, embroidery, stitching, trims identical to the original in the hero and every circle. Add nothing. Remove nothing. Do not change shape.

---

## 2. Technical Pipeline (SSOT)

Every generated detail image must complete all 4 steps:
1. **WebP Compression**:
   Converted using `sharp` to `.webp` format at `quality: 85, effort: 6`. Standard target size: **60 KB – 120 KB**.
2. **Storage Upload**:
   Uploaded to Supabase Storage bucket `product-images` (or `products`) with `cacheControl: 'public, max-age=31536000'`.
3. **Media Library Registration (`media_library`)**:
   Registered in `media_library` table with `original_filename`, `seo_filename`, `file_url`, `alt_text`, `title`, `bucket`, `ai_generated: true`, `file_size`, and `mime_type: 'image/webp'`.
   *(This ensures it immediately displays in `/admin/media` Library tab).*
4. **Product Images Gallery Registration (`product_images`)**:
   Inserted into `product_images` with `sort_order: 1, is_primary: false`.
   *(This ensures it displays on the PDP gallery, QuickView modal gallery, AND automatically serves as the card hover swap `secondImage`).*
5. **Edge Cache Purge**:
   Calls `/api/revalidate` with product tags so storefront renders instantly.

---

## 3. CLI Runner Script

Located at `.agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs`.

### Commands:
```bash
# Check products needing detail images from last 40 days:
node .agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs --days=40 --check

# Run with External Google Imagen API:
node .agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs --days=40 --method=external --key=<GEMINI_KEY>

# Process and upload locally prepared images:
node .agents/skills/product-detail-infographs/scripts/generate-product-detail-infographs.mjs --upload-dir=./prepared_images
```
