# Cloudflare Workers Separation Plan — Universal (brand-agnostic)

> **SUPERSEDED (2026-11-06):** the updated plan is **one Worker per brand**
> (store + admin together, admin chosen by host). Two-Worker split is no longer
> the target. Kept for history; see `docs/DEPLOY-CLOUDFLARE.md` for the current model.

Status: **Phase A scaffolding started** (no deploy, no DB/DNS/Vercel change).
Scope rule: **TotVogue = zero touch**. Work happens on a feature branch only.

---

## 1. Decision summary

| Question | Answer |
|---|---|
| One Worker or two? | **Two** — `store` and `admin`, same repo, same build output |
| Does two Workers reduce bundle size? | **No.** Next.js App Router cannot emit two route sets from one `app/` dir without physical restructuring. Bundle size is identical. |
| So why two? | Host isolation, separate domains/cookies/SEO surface, independent deploys, admin traffic never competes with storefront CPU, storefront Worker can 404 `/admin` at the edge. |
| Do we physically split the code now? | **No.** That is Phase B — only if metrics (CPU, error rate, cold start) demand it later. |
| Cache invalidation across Workers? | Same account, same **R2 incremental cache bucket + same Durable Object namespaces** → one `revalidateTag` reaches both. No cross-Worker HTTP call needed. |

**Verdict:** "Two Workers, one universal codebase, shared cache" = real separation without a risky rewrite.

---

## 2. Target architecture

```
                      ┌──────────────────────────────┐
www.zaynahs.pk ──────▶│ Worker: <store>-store        │──┐
                      │ WORKER_ROLE=store            │  │
                      └──────────────────────────────┘  │
                                                        ├──▶ R2: <store>-next-cache
                      ┌──────────────────────────────┐  │    (ISR / fetch cache)
admin.zaynahs.pk ────▶│ Worker: <store>-admin        │──┤
                      │ WORKER_ROLE=admin            │  │──▶ DO: tag-cache  (+ queue)
                      └──────────────────────────────┘  │
                                                        ├──▶ R2: <store>-images
img.zaynahs.pk ──────▶ R2 public bucket (custom domain) │
                                                        └──▶ Supabase (DB + Auth only)
```

Worker names, routes, bucket names, DO names are **generated from the env file** —
nothing hardcoded in source. Different store ⇒ different generated config ⇒ same code.

---

## 3. Universal (no-hardcode) contract

| Concern | Source of truth | Never |
|---|---|---|
| Site URL / host | `NEXT_PUBLIC_SITE_URL` + `settings.store_url` | literal `zaynahs.pk` in code |
| Brand name | `settings.store_name` → `NEXT_PUBLIC_BRAND_NAME` | literal brand in code |
| Admin host | `ADMIN_HOST` env (optional) → `admin.` + site host | literal `admin.<domain>` |
| Worker names | `<store>-store`, `<store>-admin` (derived) | literal worker names |
| R2 buckets | `<store>-next-cache`, `<store>-images` (derived) | literal bucket names |
| Admin emails | `NEXT_PUBLIC_ADMIN_EMAIL` (existing) | literal emails |
| Courier/payment/Meta | existing env switches | any live key in a test deploy |

Enforced by `scripts/gen-worker-config.mjs` (generated, git-ignored) + a
domain audit (`git diff` grep) before every commit.

---

## 4. Worker role system (implemented today)

`lib/config/worker-role.ts` resolves the role from, in order:

1. `WORKER_ROLE` env — set per Worker in the generated wrangler config (`store` / `admin`)
2. host prefix `admin.` — safety net if env is missing
3. fallback `all` — Vercel / local dev / single-Worker mode (zero behaviour change)

Middleware then enforces:

| Role | `/admin*` | `/` | store pages |
|---|---|---|---|
| `store` | **404** (edge, no bundle served) | normal | normal |
| `admin` | auth gate (existing) | redirect → `/admin` | allowed (public) |
| `all` | auth gate (existing) | normal | normal |

When `WORKER_ROLE` is unset (today's Vercel deployment) **nothing changes**.

---

## 5. Cache + freshness (the core rule: admin save shows instantly)

- OpenNext incremental cache → R2 binding `NEXT_INC_CACHE_R2_BUCKET`
- Tag cache → Durable Object (`DO_TAG_CACHE`), queue → Durable Object (`DO_QUEUE`)
- Admin save → `revalidateStorefrontEdge()` (existing single utility) → `revalidateTag`
  → DO tag cache invalidates → **both Workers** read the same R2 + DO → store page fresh
- No KV, no D1. No per-Worker cache divergence.
- CDN `s-maxage` must stay ≤ ISR `revalidate` (existing RULE C12) or Workers will serve stale HTML.

Existing webhook path (`app/api/revalidate`) stays the single entry point; the
Supabase DB webhook just points at the Zaynahs Worker for this brand.

---

## 6. Images

- `img.<domain>` = R2 custom domain, `Cache-Control: public, max-age=31536000, immutable`
- New uploads: `/<store>/<yyyy>/<uuid>.<ext>` → never overwritten, never stale
- `app/api/upload-image` writes to R2 when `R2_IMAGES_BUCKET` is bound, else Supabase (current behaviour)
- Migration: copy Supabase objects → R2 in batches, **render-time mapping** only
  (old URL → new URL in the image resolver). **No DB row is rewritten.**
- Reversible: mapping is a lookup; delete the map ⇒ old URLs work again.

---

## 7. Deploy pipeline (all CLI, no dashboards)

```
npm run worker:config -- --store=zaynahs     # generates worker-config/zaynahs/*.jsonc
npm run worker:build -- --role=store
npm run worker:build -- --role=admin
npm run worker:deploy -- --store=zaynahs --role=store|admin [--dry-run]
```

- `--dry-run` = `wrangler deploy --dry-run` (size report, no side effects)
- Secrets via `wrangler secret put` / `wrangler secret bulk`, never in `vars`
- Env parity check: every key in `.env.local` must exist as a Worker secret or a `vars` entry

---

## 8. Phases & stop points

| Phase | Work | Gate |
|---|---|---|
| 0 | Discovery, credential check, size/egress estimate | report |
| 1 | Next upgrade to OpenNext-supported version, OpenNext + Wrangler added, config generator | build green locally |
| 2 | R2 buckets + DO classes + bindings generated | dry-run OK |
| 3 | Role separation (middleware + role config) + sizes | **STOP A: >3 MB ⇒ Paid** |
| 4 | Test deploy (`workers.dev` + test subdomain), no real webhooks | smoke test |
| 5 | Full test table (routes, freshness, scroll/back, security, limits) | all PASS |
| 6 | Cutover prep: DNS/cache/auth/webhook diffs as dry runs + rollback | **STOP B: `GO CUTOVER`** |
| 7 | Cutover, verify, 48 h watch | daily report |

---

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Next 16.2.7 < OpenNext requirement | blocks build | upgrade on branch; TotVogue build verified locally before anything ships |
| ~57 pages + 59 API routes share one bundle | admin code shipped to store Worker | accepted (Paid = 10 MB); Phase B physical split if needed |
| `fs` / `sharp` in `app/api/upload-image` + `app/api/cache-thumbnail` | Worker runtime error | R2 path replaces `fs`; sharp stays a stub/edge-safe path |
| Free plan 10 ms CPU | storefront fails | Paid (30 s CPU) — confirm before Phase 4 |
| Cache divergence between Workers | stale store page = FAIL | shared R2 + shared DO namespaces (never per-Worker) |
| Cloudflare cache rules still serving old HTML | stale after cutover | remove HTML rules for this zone only; targeted purge |
| Supabase auth redirect list replaced instead of appended | logins break | ADD-only diff, backup before |

---

## 10. Rollback (< 5 min)

1. Restore DNS records from the exported zone snapshot (re-point to Vercel)
2. Restore Cloudflare cache rules from the exported JSON
3. Re-add the `zaynahs.pk` domain to the Vercel project
4. Supabase: delete the added webhook + added redirect entries (original list untouched)
5. Verify `www` + `admin` + one freshness check

Everything is additive except DNS/domain — which is why the export happens first.

---

## 11. Cost

| Item | Free | Paid |
|---|---|---|
| Workers CPU | 10 ms/request | 30 s/request, $5/mo |
| Bundle | 3 MB compressed | 10 MB compressed |
| R2 | 10 GB storage, 1 M class A ops | same |
| Durable Objects | SQLite-backed only, limited | full |
| Cron triggers | allowed | allowed |

Verdict: **Paid required** for this storefront (Supabase queries per page + DO queue).

---

## 12. What changed today

- `lib/config/worker-role.ts` — universal role resolver (no domain literals)
- `middleware.ts` — role gate (`store` 404s `/admin`, `admin` redirects `/` → `/admin`, unset = unchanged)
- `scripts/gen-worker-config.mjs` — generates per-store Wrangler configs from any env file
- Removed hardcoded brand/domain fallbacks (`totvogue.pk`, `Zaynahs` prompt placeholders)
- This plan

Not done yet: package install, Next upgrade, OpenNext config, R2/DO bindings — all need the Paid plan + R2 enabled.
