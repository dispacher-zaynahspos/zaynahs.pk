# 28 — Traffic Analytics (first-party `page_views`)

Store traffic ab **first-party** record hota hai — real data, accurate, free, aur self-cleaning. Koi Cloudflare estimate / synthesized city nahi (wo RULE #4 data-integrity todta tha, isliye hata diya gaya).

## RULE TA1 — One tracking source, one aggregation source (SSOT)
- **Write (SSOT):** sirf `app/api/track/route.ts` page-view row likhta hai. Client beacon `components/store/TrafficBeacon.tsx` (store layout me mounted) har storefront navigation pe ek keepalive POST bhejta hai.
- **Read/aggregate (SSOT):** sirf Postgres RPC `get_traffic_stats(p_start, p_end)` totals + per-country + per-city deta hai. Admin API `app/api/admin/traffic/route.ts` yahi call karta hai. Koi alternate traffic query / in-memory store likhna banned.
- Koi dusra "visit counter" / analytics path mat banao — inhi modules ko extend karo.

## RULE TA2 — Data model + privacy
- Table `page_views` (`SUPER_MASTER_SCHEMA.sql` + migration `20261001120000_add_page_views_traffic.sql`): UUID PK, snake_case, RLS on (public INSERT, admin/service-role read only — koi public SELECT nahi).
- Columns: `path, country (ISO-2), city, visitor_id (cookie-less localStorage id), referrer, created_at`.
- **No PII:** IP kabhi store nahi hota. Geo sirf edge headers se (`cf-ipcountry`/`cf-ipcity`, Vercel fallback). `visitor_id` random hai (unique-visitor count ke liye), kisi user se linked nahi.
- Beacon `/admin`, `/api`, `/_next` paths skip karta hai (storefront traffic only).

## RULE TA3 — Ranges (built-in + custom)
Admin traffic UI (`app/admin/traffic/page.tsx`) support karta hai: `1h`, `24h`, `7d`, `30d`, `90d` (3M button), aur **custom date-to-date** (`?start=&end=`). Sab ek hi table pe compute hote hain, isliye custom range sirf do dates hai. Custom range **90-day retention** tak clamp hota hai.

## RULE TA4 — Auto-purge (DB kabhi na bhare)
`pg_cron` job `purge-page-views-90-days` roz 03:00 pe 90 din se purane rows delete karta hai. Isliye:
- Storage flat rehti hai (~100 bytes/row, <10 MB typical) — Supabase free tier (500 MB) ke liye kuch bhi nahi.
- Koi manual cleanup / Vercel cron nahi chahiye.
- 90 din = "last 3 months" ceiling. Agar aur lamba retention chahiye to cron interval + custom-range clamp dono badalna (aur storage impact note karna).

## RULE TA5 — Clone parity (0 manual effort)
`page_views` table + `get_traffic_stats` RPC + purge cron `SUPER_MASTER_SCHEMA.sql` me hain, isliye `npm run clone:setup -- --store=<name>` (jo `init-db.mjs` → master schema apply karta hai) har naye clone pe traffic system **day-1 out-of-the-box** bana deta hai. Koi naya env var nahi chahiye (Cloudflare/Pusher traffic ke liye optional ho gaye). SYNC1 ke mutabiq migration ↔ master schema hamesha in-sync rahein.
