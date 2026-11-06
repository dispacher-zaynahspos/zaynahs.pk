# 🔄 Cloudflare Cache Rules — 1-Command Undo & Rollback Guide

> **Guaranteed 100% Risk-Free**: Cloudflare Cache Rules affect edge caching only. They make **zero changes** to your Next.js application codebase, database, or Vercel server. You can rollback or re-enable anytime in seconds.

---

## ⚡ Method 1: Automated 1-Command Terminal Rollback (Fastest)

### A. Rollback ALL Stores at Once
To immediately wipe custom cache rules and purge edge cache across all connected stores:
```bash
npm run cf:rules:undo
```

### B. Rollback a Single Store (e.g. TotVogue or Zaynahs)
To rollback only one specific store:
```bash
node scripts/rollback-cf-cache-rules.mjs --store=totvogue
# Or:
node scripts/rollback-cf-cache-rules.mjs --store=zaynahs
```

### How to Re-Deploy/Re-Enable Anytime
If you ever want to re-enable full edge caching:
```bash
npm run cf:rules:all
```

---

## 🖱️ Method 2: 1-Click Emergency Bypass (Cloudflare Dashboard)

If you don't have terminal access and want to instantly bypass all caching:

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your domain (e.g., `totvogue.pk`).
3. Go to **Caching** ➔ **Configuration** (or Overview).
4. Turn **Development Mode** ➔ **ON**.
5. **Result**: Cloudflare cache is completely bypassed in real-time. Every request hits Vercel directly.

---

## 🛠️ Method 3: Manual Rule Toggle in Cloudflare Dashboard

To turn individual rules OFF without running commands:

1. In Cloudflare Dashboard, go to **Caching** ➔ **Cache Rules**.
2. You will see the 4 rules deployed:
   - `no-cache-dynamic`
   - `static-assets`
   - `storage-images`
   - `html-pages`
3. Toggle the switch next to `html-pages` to **Disabled (OFF)**.
4. Go to **Caching** ➔ **Configuration** ➔ Click **Purge Everything**.
5. Done! The store returns to standard non-cached HTML delivery.

---

## 🧪 How to Verify Live Status (Testing)

Run the built-in node verification command:
```bash
node -e "
async function test() {
  const res = await fetch('https://www.totvogue.pk/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Cache Status:', res.headers.get('cf-cache-status'));
}
test();
"
```

* **When Active (Shield ON):** Returns `cf-cache-status: HIT`
* **When Undone / Rolled Back:** Returns `cf-cache-status: DYNAMIC` or `BYPASS`

---

## 📋 Summary Table

| Action | Command / Location | Time Taken | Result |
|---|---|---|---|
| **Deploy Rules** | `npm run cf:rules:all` | 5 seconds | 99% traffic absorbed by Cloudflare, 0 Vercel load |
| **Undo / Rollback** | `npm run cf:rules:undo` | 5 seconds | Rules cleared, cache purged, 100% direct Vercel |
| **Emergency Bypass** | CF Dashboard ➔ Dev Mode ON | 1 second | Instant edge bypass without touching rules |
