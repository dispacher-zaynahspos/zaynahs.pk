# Media Modal Architecture

## Overview

A single **`MediaSelectorModal`** + **`MediaManager`** handles all media needs across the entire app — admin panels, settings, product forms, homepage customizer, reviews, categories, etc. No separate image pickers exist.

---

## File Map

```
components/admin/
├── MediaSelectorModal.tsx      ← Reusable modal shell (portal to body)
├── MediaManager.tsx            ← Core engine (~2146 lines)
└── SortableMediaGrid.tsx       ← Drag-and-drop grid (@dnd-kit)

app/admin/media/
├── page.tsx                    ← SSR page
└── MediaLibraryClient.tsx      ← Thin wrapper → <MediaManager mode="library" />

app/api/media/
├── upload/route.ts             ← POST: upload + Vision AI auto-meta
└── ai-meta/route.ts            ← POST: on-demand AI alt/title/description

lib/
├── uploadImage.ts              ← Core upload: validate → compress → Storage → DB
├── services/media.ts           ← Server actions: getDeletedMedia, restore, hardDelete
└── utils/imageCompressor.ts    ← Client-side WebP + HEIC support
```

---

## Component Hierarchy

```
MediaSelectorModal
  └── MediaManager (mode: "selector" | "library")
        └── SortableMediaGrid (when reordering needed)
```

### MediaSelectorModal Props

```ts
interface MediaSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void   // returns selected file URLs
  multiple?: boolean                    // multi-select (default: false)
}
```

### MediaManager Modes

| Mode | Rendered In | Behavior |
|---|---|---|
| `"library"` | `/admin/media` page | Full page: upload, search, filter, bulk ops, preview/edit modal, Cleaner Pro tab, trash management |
| `"selector"` | `MediaSelectorModal` | Grid + inline upload, checkbox selection, "Add Selected" footer button → `onSelect(urls)` |

---

## Where It's Used

| Context | Component | `multiple` | Usage |
|---|---|---|---|
| Product images | `ProductForm.tsx:3049` | `true` | Add multiple product images |
| Category image | `CategoryManager.tsx:777` | `false` | Set category thumbnail |
| Logo / Favicon | `GeneralTab.tsx:375` | `false` | Select logo or favicon URL |
| Exit-intent popup | `PremiumTab.tsx:1093` | `false` | Set popup background image |
| Size guide image | `SizeGuidesTab.tsx:483` | `false` | Set size guide image |
| Homepage sections | `CustomizerEditor.tsx:1534` | `false` | Banners, slides, grid items |
| Social proof screenshots | `PostReviewModal.tsx:362` | `false` | Proof/review images |

All consumers follow the same pattern:

```tsx
const [open, setOpen] = useState(false)

<MediaSelectorModal
  isOpen={open}
  onClose={() => setOpen(false)}
  onSelect={(urls) => {
    if (urls.length > 0) setValue(urls[0])  // or urls for multiple
    setOpen(false)
  }}
  multiple={false}
/>
```

---

## Upload Flow

```
User drops/clicks file
  → processUploadedFiles() creates UploadTask
  → validate: video ≤60s, show WebM warning if needed
  → executeActualUpload() → POST /api/media/upload (FormData)
       → uploadImage(file, bucket)
            → validate extension (jpg/jpeg/png/webp/avif/mp4/mov/webm/ogg)
            → compress to WebP (max 1200px, quality 80)
            → upload to Supabase Storage (product-images bucket)
            → INSERT into media_library table
       → if auto_media_ai enabled → routeVision() generates alt/title/desc/caption
       → return { url, id, ai_generated, meta }
  → on success → auto-refresh media grid
```

---

## Database Schema

```sql
CREATE TABLE media_library (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_filename TEXT,
  seo_filename      TEXT,
  file_url          TEXT NOT NULL,
  alt_text          TEXT,
  title             TEXT,
  description       TEXT,
  caption           TEXT,
  ai_generated      BOOLEAN DEFAULT false,
  ai_enabled        BOOLEAN DEFAULT true,
  bucket            TEXT,
  file_size         BIGINT,
  mime_type         TEXT,
  sort_order        INTEGER DEFAULT 0,
  deleted_at        TIMESTAMPTZ DEFAULT NULL,  -- soft delete
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

Storage bucket: `product-images` — public read, authenticated write.

---

## Supported File Types

| Type | Extensions | Handling |
|---|---|---|
| Images | jpg, jpeg, png, webp, avif (+ HEIC via converter) | Auto-convert to WebP, max 1200px, Vision AI meta |
| Videos | mp4, mov, webm, ogg | Duration ≤60s enforced, WebM recommended warning, no AI processing |
| Documents | ❌ Not supported | — |

---

## Delete / Trash / Cleanup

| Action | Mechanism |
|---|---|
| Soft delete | `UPDATE media_library SET deleted_at = NOW()` — file stays in storage |
| Restore | `UPDATE media_library SET deleted_at = NULL` |
| Hard delete | `DELETE FROM media_library` + `storage.remove([filename])` |
| Bulk restore | `bulkRestoreMedia(ids)` |
| Bulk hard delete | `bulkHardDeleteMedia(items)` — DB + storage |

**Cleaner Pro** (in MediaManager w/ `mode="library"`):
- Scans all DB tables for URL references (categories, products, settings, homepage sections, size guides)
- Shows "Unused" vs "In-Use" sections
- Supports download as ZIP or bulk delete

---

## Vision AI Integration

- **Auto on upload**: when `settings.auto_media_ai = true`, `routeVision()` generates alt/title/description/caption
- **On-demand**: `POST /api/media/ai-meta`
- **Bulk**: select items in library → "Bulk Vision AI"
- Skips videos (only images are processed)
