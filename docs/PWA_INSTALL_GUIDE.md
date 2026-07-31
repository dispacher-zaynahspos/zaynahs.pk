# PWA Installation Guide — Admin vs Storefront

## Overview

Is project mein do alag alag **dynamic manifests** hain — ek storefront ke liye aur ek admin dashboard ke liye. Jab user kisi bhi page par jata hai, to automatically sahi manifest inject ho jata hai jis se browser PWA install prompt dikha sakta hai.

---

## 1. Manifest Strategy (Do Alag Manifests)

| Feature | Storefront (`/manifest.json`) | Admin (`/admin-manifest.json`) |
|---|---|---|
| **File** | `app/manifest.json/route.ts` | `app/admin-manifest.json/route.ts` |
| **App Name** | `{brandName} - Online Store` | `{brandName} Admin` |
| **Short Name** | `{brandName}` | `Admin` |
| **Start URL** | `/` | `/admin/dashboard` |
| **Scope** | `/` (default — full site) | `/admin/` (sirf admin pages) |
| **Display** | `standalone` | `standalone` |
| **BG Color** | `#1a1a2e` | `#0f0f1b` (darker) |
| **Theme Color** | `#1a1a2e` | `#1a1a2e` |

Dono manifests **fully dynamic** hain — icons, name, description settings table se aate hain, static JSON nahi hai.

---

## 2. Manifest Injection Kaise Hota Hai (Dual-Layer)

### Layer 1 — Root Layout (`app/layout.tsx:222-231`)

Har page load par ek **inline `<script>`** chalta hai jo path check karta hai:

```js
var p = window.location.pathname;
var m = p.startsWith('/admin') ? '/admin-manifest.json' : '/manifest.json';
var el = document.createElement('link');
el.rel = 'manifest';
el.href = m;
document.head.appendChild(el);
```

- Agar URL `/admin` se start hota hai → `/admin-manifest.json` inject hota hai
- Warna → `/manifest.json` inject hota hai

### Layer 2 — Admin Layout (`app/admin/layout.tsx:82-98`)

Admin layout ek **React `useEffect`** bhi chalatā hai jo manifest ko dobara swap karta hai:

```ts
useEffect(() => {
  const storeLink = document.querySelector('link[rel="manifest"]');
  if (storeLink) storeLink.remove();

  const adminLink = document.createElement('link');
  adminLink.rel = 'manifest';
  adminLink.href = '/admin-manifest.json';
  adminLink.id = 'admin-manifest';
  document.head.appendChild(adminLink);

  return () => {
    const el = document.getElementById('admin-manifest');
    if (el) el.remove();
    if (storeLink) document.head.appendChild(storeLink.cloneNode());
  };
}, []);
```

**Kyun?** — Root layout non-React inline script hai (hydration se pehle chalta hai). Admin layout ka `useEffect` React hydration ke baad dubara ensure karta hai ke sahi manifest laga ho. Cleanup function admin se bahar nikalte wqt storefront manifest restore kar deta hai.

---

## 3. Service Worker Strategy ("Self-Destruct" Approach)

**File:** `public/sw.js`

```js
// Install: immediately take over
self.addEventListener('install', (e) => { self.skipWaiting(); });

// Activate: delete ALL caches → unregister itself → claim clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => self.registration.unregister())
     .then(() => self.clients.claim())
  );
});

// Fetch: DO NOT intercept anything (passive)
self.addEventListener('fetch', (e) => { /* no-op */ });
```

- **Purpose:** PWA installable rahe (manifest valid hai) lekin SW caching se hone wale stale-asset bugs na hon
- **Kaise?** — SW install hote hi sab caches delete kar deta hai, phir khud ko unregister kar leta hai
- **Cloudflare CDN** caching sambhalta hai, SW koi request intercept nahi karta
- Root layout har page load par existing SW ko bhi force-unregister kar deta hai (`navigator.serviceWorker.getRegistrations()`)

---

## 4. Install Prompt

**Custom install prompt nahi hai.** Codebase mein kahin bhi `beforeinstallprompt` event listener, `deferredPrompt`, ya custom "Install App" button nahi hai.

**Yeh rely karta hai browser ke default PWA install flow par:**
- Valid manifest serve ho raha hai (storefront ya admin)
- HTTPS par serve ho raha hai
- Browser apne aap "Add to Home Screen" prompt dikhata hai jab conditions satisfy hon

Admin ya storefront — dono ke liye browser ka default prompt hi kaam karta hai.

---

## 5. Icons & Assets (Fully Dynamic)

| Asset | Source | Fallback |
|---|---|---|
| Manifest icon 192×192 | `settings.faviconUrl` | `settings.logoUrl` → `/favicon.ico` |
| Manifest icon 512×512 | `settings.logoUrl` | `settings.faviconUrl` → `/favicon.ico` |
| Favicon (`/favicon.ico`) | `app/favicon.ico/route.ts` — DB se fetch | Transparent 1×1 pixel ICO |
| Apple Touch Icon | `settings.logoUrl` via `generateMetadata` | `faviconUrl` |

**Public folder mein koi static icon file nahi hai** — sab DB settings se serve hota hai.

---

## 6. Data Flow Diagram

```
User visits / (storefront)
         │
         ▼
Root Layout inline script
  ├─ pathname check → "/manifest.json"
  └─ injects <link rel="manifest" href="/manifest.json">
         │
         ▼
Browser reads manifest:
  Name: "Zaynahs - Online Store"
  Start URL: /
  Scope: /
         │
         ▼
Browser shows PWA install prompt (default)
Browser downloads sw.js → cleanup → self-unregister


User visits /admin/dashboard
         │
         ▼
Root Layout inline script
  ├─ pathname check → "/admin-manifest.json"
  └─ injects <link rel="manifest" href="/admin-manifest.json">
         │
         ▼
Admin Layout useEffect (hydration ke baad)
  ├─ removes old storefront manifest
  ├─ injects <link id="admin-manifest" href="/admin-manifest.json">
  └─ cleanup: restore storefront manifest on unmount
         │
         ▼
Browser reads manifest:
  Name: "Zaynahs Admin"
  Start URL: /admin/dashboard
  Scope: /admin/
         │
         ▼
Browser shows PWA install prompt (default)
```

---

## 7. Key Files Reference

| File | Role |
|---|---|
| `app/manifest.json/route.ts` | Storefront manifest generator |
| `app/admin-manifest.json/route.ts` | Admin manifest generator |
| `app/layout.tsx` (lines 222-243) | Inline script: manifest injection + SW unregister |
| `app/admin/layout.tsx` (lines 82-98) | React useEffect: manifest swap for admin |
| `public/sw.js` | Self-destruct service worker |
| `lib/hooks/useOrderNotification.ts` | SW notification (admin only) |
| `app/favicon.ico/route.ts` | Dynamic favicon from DB |

---

## 8. Important Notes

- **Admin ka install prompt storefront se alag app hai** — dono alag scope aur start URL ki wajah se browser alag apps treat karta hai
- **Service worker caching nahi karta** — ye intentional hai. Cloudflare CDN caching ka kaam karta hai (24h HTML cache via `CDN-Cache-Control`)
- **Naya deploy → Cloudflare cache purge** zaroori hai (see `docs/MASTER_CACHE_GUIDE.md`)
- **Notification icons missing** — `useOrderNotification.ts` mein `/icons/icon-192x192.png` hardcoded hai jo exist nahi karta. Agar push notification kaam karna hai to ye icon `public/` mein dalna hoga ya settings-based banana hoga
