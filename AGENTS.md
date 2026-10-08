<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Index (Full Stack Autonomous Agent Rules)
Next.js · React · Node.js · Vercel · GitHub · Supabase · Cloudflare | E-commerce + POS
Stores: **TotVogue · Zaynahs · MiniMahal · LittleMister** (+ future clones)

> ⚠️ This file is an INDEX only. Every rule lives in exactly ONE atomic file below — no duplicates, nothing summarized-away. Read the linked file before touching related code. If a rule seems to conflict, the atomic file is the source of truth (this index is not).

## ⛔ RULE #0 — ABSOLUTE PRIME DIRECTIVES (read first, always active)
1. **Fulfill the request** — modify/refactor/create exactly what's asked, no hesitation.
2. **Mobile-first ALWAYS** — every component/page/layout designed mobile-first; desktop is enhancement.
3. **Direct action** — find files, implement fixes directly, no unnecessary questions.
4. **Data integrity first** — product/stock/order data never approximated; if uncertain → throw error.
5. **TypeScript strict** — every file `.tsx`/`.ts`, no `any` ever.
6. **No email system** — WhatsApp-only ordering. Never suggest/implement email flows.
7. **Agent executes** — run terminal commands autonomously; never ask user to run commands manually unless truly required.
8. **Fast & direct** — don't waste tokens on unnecessary MCP tools/browsing/file reads; resolve via direct code analysis.
9. **Product card changes** → MUST follow `docs/prompts/add_card_style_prompt.md` step-by-step and `docs/UI_CARDS.md` (see [14-design-system.md](docs/agent-rules/14-design-system.md) RULE DS2 & RULE BASE-CARDS).
10. Instant price/cache rule (RULE D12) → see [08-caching-isr-ssr.md](docs/agent-rules/08-caching-isr-ssr.md).
11. Instant 0ms navigation & tabs across all functional tabs (Categories, Products, Reviews, Cart, Settings) (RULE F1) → see [03-frontend-nextjs-react.md](docs/agent-rules/03-frontend-nextjs-react.md) and `docs/UI_PERFORMANCE_GUIDE.md` Section 8.
12. **Single Source of Truth (SSOT1)** — zero duplicate implementations; any feature that appears in 2+ places must reuse ONE shared component/logic/data source. Before writing new code, check if it already exists. → see [27-single-source-of-truth.md](docs/agent-rules/27-single-source-of-truth.md).
13. **snake_case only (D13), UUID PK (D14), atomic writes (D15), RLS on every data table** → see [05-database-supabase.md](docs/agent-rules/05-database-supabase.md). Cache invalidation on every write via one shared utility (C10) → see [08-caching-isr-ssr.md](docs/agent-rules/08-caching-isr-ssr.md).
14. **Correct permanent architecture > legacy data.** When old data conflicts with the correct structure (snake_case, UUID, RLS, deduplicated implementations, correct field/file placement), the structure wins — rebuild/restructure data as needed via numbered migrations, don't compromise the design to preserve legacy rows. Never bends: secrets/credentials/PII stay server-side only, never client-exposed/logged.
15. **Agent decides permanently.** Any agent working from this file makes permanent architectural decisions itself using professional judgment rather than stopping to ask — EXCEPT: (a) applying a **destructive/structural change to the LIVE database** (drops, PK→UUID, RLS policy changes, data-affecting migrations) which must ship as a REVIEWABLE numbered migration and be applied after review + a customer-flow smoke test; (b) anything that would expose secrets/PII or violate usage policy. Non-destructive fixes: act directly.
16. **Server-side auth on every privileged route/RPC.** Use the shared `lib/auth/requireAdmin` (API) + root `middleware.ts` (admin UI). Never hand-roll inline auth. Secrets never enter client-facing `StoreSettings` (server-only via `lib/services/settings/server-secrets.ts` / `getAISettings`). → see [27-single-source-of-truth.md](docs/agent-rules/27-single-source-of-truth.md) "Canonical shared modules".
17. **One-Command Clone Setup + always-in-sync.** Jab user kahe **"clone setup" / "new store setup" / "naya clone"** → agent `docs/CLONE_SETUP_INTAKE.md` ka intake flow follow kare: pehle required API tokens + "kahan se milega" + permissions ki list de, user ke sab dene par `env-backups/<store>.env.local` likhe, phir `npm run clone:setup -- --store=<store> --deploy --yes` chalaye (orchestrator `scripts/clone-setup.mjs`: preflight → DB schema+webhooks+admin+brand → Vercel env+deploy → Cloudflare DNS+cache rules → verify; all idempotent). **On EVERY migration/feature/env/trigger change** the setup files must stay in sync — enforced by `npm run check:setup` (`prebuild` + optional `npm run setup:hooks` git pre-commit) which blocks build/commit on drift (migrations↔`SUPER_MASTER_SCHEMA.sql`, revalidate triggers, clone env-docs). → see RULE SYNC1 in [05-database-supabase.md](docs/agent-rules/05-database-supabase.md). **Aur har fix/feature ke saath clone setup + master schema + guides + UI/UX docs usi task me update hon → see RULE SYNC2 in [05-database-supabase.md](docs/agent-rules/05-database-supabase.md).**

## 🔎 Deep-audit record (Passes 0–10, 2026-09)
Full-system audit + permanent fixes are documented in `docs/AUDIT_PASS{0..10}_*.md`. Verified with a clean production build (`next build` → ✓ Compiled successfully, 294/294 pages) and `tsc --noEmit` = 0 errors. Canonical shared modules established (the ONLY entry point for their job, see rule 27): `lib/features/premium.ts` (gating), `lib/config/singleton-ids.ts` (singleton row + system-category IDs), `lib/services/ai/ai-settings-client.ts` (AI toggle), `components/store/product-card/hooks/useWishlist.ts` (wishlist), `components/store/product-card/hooks/useEmblaGallery.ts` (gallery wiring), `components/admin/customizer/shared/MediaField.tsx` (media URL field), `lib/utils/arrayMove.ts::moveItemInArray` (list reorder), `lib/revalidate.ts::revalidateStorefrontEdge` (admin cache purge), `lib/auth/requireAdmin.ts` + `middleware.ts` (auth), `lib/services/settings/server-secrets.ts` (secrets). DB verified already UUID + snake_case compliant. Reviewable-but-not-applied migrations (live-DB coordinated): `supabase/migrations/20260926150000_REVIEW_rls_secret_hardening.sql`, `20260926160000_REVIEW_perf_indexes.sql`, `20260926170000_add_contact_messages.sql`.

## 📖 Atomic Rule Files
| # | File | Covers |
|---|------|--------|
| 00 | [00-prime-directives.md](docs/agent-rules/00-prime-directives.md) | Full unpacked Rule #0 |
| 01 | [01-core-operating-principles.md](docs/agent-rules/01-core-operating-principles.md) | Root-cause first, scope discipline, logging |
| 02 | [02-error-detection-autofix.md](docs/agent-rules/02-error-detection-autofix.md) | Auto-detect/fix build/runtime errors |
| 03 | [03-frontend-nextjs-react.md](docs/agent-rules/03-frontend-nextjs-react.md) | App Router, safe access, SEO, icons |
| 04 | [04-backend-api-routes.md](docs/agent-rules/04-backend-api-routes.md) | API validation, error handling, rate limits |
| 05 | [05-database-supabase.md](docs/agent-rules/05-database-supabase.md) | Schema, RLS, D1–D12, master schema |
| 06 | [06-git-github.md](docs/agent-rules/06-git-github.md) | Commits, branches, secrets |
| 07 | [07-deployment-vercel-cloudflare.md](docs/agent-rules/07-deployment-vercel-cloudflare.md) | Deploy checklist, rollback, purge |
| 08 | [08-caching-isr-ssr.md](docs/agent-rules/08-caching-isr-ssr.md) | C1–C9, ISR, instant price updates |
| 09 | [09-ecommerce-pos.md](docs/agent-rules/09-ecommerce-pos.md) | Stock, payments, PKR formatting |
| 10 | [10-whatsapp-order-flow.md](docs/agent-rules/10-whatsapp-order-flow.md) | W1–W2, message format |
| 11 | [11-storage-images.md](docs/agent-rules/11-storage-images.md) | S1–S6, bucket, compressor, media selector |
| 12 | [12-testing-verification.md](docs/agent-rules/12-testing-verification.md) | Happy path + edge case rules |
| 13 | [13-autonomy-boundaries.md](docs/agent-rules/13-autonomy-boundaries.md) | Auto-allowed / confirm-first / never-auto |
| 14 | [14-design-system.md](docs/agent-rules/14-design-system.md) | Colors, tokens, DS1–DS17 (sticky bars, safe bounds, swatches, controls, linked image swap), anti-bloat |
| 15 | [15-shared-components-ui-modules.md](docs/agent-rules/15-shared-components-ui-modules.md) | Component library + mandatory module map |
| 16 | [16-multi-system-architecture.md](docs/agent-rules/16-multi-system-architecture.md) | /store vs /admin boundaries |
| 17 | [17-mobile-native-app-style.md](docs/agent-rules/17-mobile-native-app-style.md) | M1–M5, cards, touch, jitter prevention |
| 18 | [18-multi-domain-rules.md](docs/agent-rules/18-multi-domain-rules.md) | getSiteUrl, brand, OG meta, no hardcoded domains |
| 19 | [19-navigation-state-restoration.md](docs/agent-rules/19-navigation-state-restoration.md) | N1–N3, scroll/tab persistence |
| 20 | [20-error-diagnostics-matrix.md](docs/agent-rules/20-error-diagnostics-matrix.md) | Copy-pasted error → instant fix matrix |
| 21 | [21-cloudflare-supabase-api-usage.md](docs/agent-rules/21-cloudflare-supabase-api-usage.md) | API-only ops, curl recipes, self-tests |
| 22 | [22-credentials-management.md](docs/agent-rules/22-credentials-management.md) | CRED1, VERCEL1, env-backups structure |
| 23 | [23-code-architecture-modularity.md](docs/agent-rules/23-code-architecture-modularity.md) | O1 — 300–400 line limit, module reuse & code style |
| 24 | [24-vercel-build-security.md](docs/agent-rules/24-vercel-build-security.md) | V1 — safe client init, no `!` assertions |
| 25 | [25-ai-seo-copywriting-engine.md](docs/agent-rules/25-ai-seo-copywriting-engine.md) | AI1 — vision + copywriting models |
| 26 | [26-project-reference-table.md](docs/agent-rules/26-project-reference-table.md) | All store refs, zone IDs, secrets, URLs (5 stores: TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo). **RULE CRED-ENVBACKUP**: `env-backups/*.env.local` is the canonical store registry — always scan it before multi-store ops, never hardcode a store list |
| 27 | [27-single-source-of-truth.md](docs/agent-rules/27-single-source-of-truth.md) | SSOT1 — zero duplicate implementations, one shared source per feature |
| 28 | [28-traffic-analytics.md](docs/agent-rules/28-traffic-analytics.md) | TA1–TA5 — first-party page_views traffic, custom ranges, 90-day auto-purge |

## 🔗 External Docs (unchanged locations)
- `docs/UI_RULES.md` — design-system UI reference. **§9 popup/modal/bottom-sheet scroll standard** (shared `lib/hooks/useBodyScrollLock.ts`, `flex-1 min-h-0 overflow-y-auto overscroll-contain`) and **§10 product-card interaction trigger** (Shopify-style: touch = single scroll-focused card plays hover image + spawns icons via shared `lib/hooks/useMobileCardFocus.ts`; hover devices use CSS `@media (hover:hover)`; full-card overlay `Link` = single-tap opens product, icons win at `z-[25]`) live here.
- `docs/UI_CARDS.md` — master product card system, controls, modules, base themes protection & Elessi archetype reference.
- `docs/SCHEMA_CHANGE_LOG.md` — every DB change, dated
- `docs/STORE_GUIDE.md` — GitHub & Supabase credentials
- `docs/CLOUDFLARE_SUPABASE_SETUP.md` — cache rules, webhooks, ISR guide, 1-click setup scripts
- `docs/STORE_TESTING_GUIDE.md` — cache & webhook test commands
- `docs/NEW_PROJECT_SETUP_GUIDE.md` — full clone & deploy guide. **One-Command Clone Setup system:** `npm run clone:setup -- --store=<store> --deploy --yes` (preflight → DB schema+webhooks+admin+brand → Vercel env+deploy → Cloudflare DNS+cache rules → verify; all idempotent; orchestrator `scripts/clone-setup.mjs`). **Setup stays in sync automatically:** `npm run check:setup` (runs on `prebuild` + optional `npm run setup:hooks` git pre-commit) blocks any build/commit where migrations↔master schema, revalidate triggers, or clone env-docs drift — see RULE SYNC1 in [05-database-supabase.md](docs/agent-rules/05-database-supabase.md).
- `docs/CLONE_SETUP_INTAKE.md` — **"clone setup" trigger flow (all IDEs/agents):** required API tokens + where-to-get + permissions table → write `env-backups/<store>.env.local` → run `clone:setup`. Follow this verbatim when the user asks to set up a new store/clone.
- `docs/GEMINI_AUTOMATION_GUIDE.md` — Gemini automation scripts (product renaming/listings)
- `docs/SUPABASE_API_GUIDE.md` — curl reference for every Supabase Management/Service API op
- `docs/VERCEL_BUILD_FIXES.md` — known build error fixes
- `docs/LESSONS_LEARNED.md` — past bugs & fixes
- `docs/prompts/add_card_style_prompt.md` — product card style implementation checklist
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` — single source of truth for DB
- `lib/revalidate.ts`, `app/api/revalidate/route.ts` — cache/webhook dispatch

## 🧭 How an agent should use this file
1. Read this index + the atomic file(s) relevant to the current task.
2. Never skip 00–02 (prime directives, core principles, error auto-fix) — always active.
3. If a task touches DB → read 05. If it touches UI → read 03 + 14 + 15. If it touches caching/deploy → read 07 + 08 + 21.
4. Cross-check 26 (project reference table) before ANY multi-store operation.

## ➕ RULE IDX1 — Where to add a NEW rule (MANDATORY)
Whenever the user says "add this rule" / "iska rule add karo" / gives any new instruction meant to become a permanent project rule:
1. **Never add it to `AGENTS.md` (this file) directly.** This file is an index only — it never holds rule bodies.
2. **Find the matching atomic file** in `agent-rules/` by topic (check the table above) and add the rule there, in the right section, following that file's existing style/format.
3. **If no existing file matches the topic**, create a new atomic file: `agent-rules/NN-topic-name.md` (next available number, short kebab-case name), write the rule there, and then add a new row to the table above pointing to it — so it stays discoverable from the index.
4. If the rule touches more than one topic, put the full rule in the single most relevant file and add a one-line cross-reference note in the other related file(s) — never duplicate the full rule text in two places.
5. Confirm to the user which file the rule was added to (or which new file was created).
