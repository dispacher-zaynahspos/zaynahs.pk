# 07 — Deployment Rules (Vercel / Cloudflare)

- Deploy se pehle local build 100% pass hona chahiye.
- Preview deploy pe test karo, phir production.
- Verify env vars are synced with the dashboard before deploy.
- On failure, fix root-cause from logs — no blind retry.
- Every production deploy needs a ready rollback plan.

## Mandatory post-push chain (never skip, never use background timers)
```bash
git push origin main; git push zaynahspk main; git push minimahal main; git push littlemister main; git push minioutfits main; sleep 240 && node scripts/post-deploy-fix.mjs
```
`sleep 240` blocks the terminal so the purge is guaranteed to run after Vercel finishes deploying — background schedule/timer tools get silently cancelled if the user sends a message or another background task finishes.

`post-deploy-fix.mjs` automatically:
1. Reads `.env.local` (current store) + ALL `env-backups/*.env.local` files.
2. Purges Vercel ISR cache (requires `VERCEL_TOKEN` + `VERCEL_PROJECT_NAME`).
3. Purges Cloudflare cache for EVERY store zone found.
4. Triggers `/api/revalidate` webhook on the current store.
5. Verifies all pages return HTTP 200.

If any zone/token fails → fix immediately, never skip.

## RULE AUTO1 — Agent automation flow (clone/setup)
When the user provides these 7 values (project ref ID auto-extracted from URL):
1. Supabase URL (ref auto-extracted) + service role key
2. Cloudflare zone ID + API token
3. Vercel API token (Settings → Tokens → Create)
4. GitHub personal access token (repo + contents write)
5. Domain name

The agent automatically:
- **Supabase API**: executes `SUPER_MASTER_SCHEMA.sql` (tables, policies, bucket), creates storage bucket, creates 5 webhooks (products, categories, homepage_sections, store_settings, reviews).
- **Cloudflare API**: creates 4 Cache Rules (`no-cache-dynamic`, `static-assets`, `html-pages`, `supabase-images`), 3 Page Rules (cart/checkout/my-account → bypass), DNS records (A, CNAME, TXT — all proxied/orange-cloud).
- **GitHub + Vercel API**: `git init` + commit + push (via `GITHUB_TOKEN`); `npm i -g vercel` → `vercel --prod --token=$VERCEL_TOKEN`; sets Vercel env vars via API (from `.env.local`); `vercel domains add [domain]`; auto SSL enable.
- **Verify**: cache headers (HIT/MISS/BYPASS), webhook (`revalidated:true`), CF purge API, page rules active.

Full details: `docs/NEW_PROJECT_SETUP_GUIDE.md#agent-automation--full-setup-flow`.
