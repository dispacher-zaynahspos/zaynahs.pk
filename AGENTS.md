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
9. **Product card changes** → MUST follow `docs/prompts/add_card_style_prompt.md` step-by-step (see [14-design-system.md](agent-rules/14-design-system.md) RULE DS2).
10. Instant price/cache rule (RULE D12) → see [08-caching-isr-ssr.md](agent-rules/08-caching-isr-ssr.md).

## 📖 Atomic Rule Files
| # | File | Covers |
|---|------|--------|
| 00 | [00-prime-directives.md](agent-rules/00-prime-directives.md) | Full unpacked Rule #0 |
| 01 | [01-core-operating-principles.md](agent-rules/01-core-operating-principles.md) | Root-cause first, scope discipline, logging |
| 02 | [02-error-detection-autofix.md](agent-rules/02-error-detection-autofix.md) | Auto-detect/fix build/runtime errors |
| 03 | [03-frontend-nextjs-react.md](agent-rules/03-frontend-nextjs-react.md) | App Router, safe access, SEO, icons |
| 04 | [04-backend-api-routes.md](agent-rules/04-backend-api-routes.md) | API validation, error handling, rate limits |
| 05 | [05-database-supabase.md](agent-rules/05-database-supabase.md) | Schema, RLS, D1–D12, master schema |
| 06 | [06-git-github.md](agent-rules/06-git-github.md) | Commits, branches, secrets |
| 07 | [07-deployment-vercel-cloudflare.md](agent-rules/07-deployment-vercel-cloudflare.md) | Deploy checklist, rollback, purge |
| 08 | [08-caching-isr-ssr.md](agent-rules/08-caching-isr-ssr.md) | C1–C9, ISR, instant price updates |
| 09 | [09-ecommerce-pos.md](agent-rules/09-ecommerce-pos.md) | Stock, payments, PKR formatting |
| 10 | [10-whatsapp-order-flow.md](agent-rules/10-whatsapp-order-flow.md) | W1–W2, message format |
| 11 | [11-storage-images.md](agent-rules/11-storage-images.md) | S1–S6, bucket, compressor, media selector |
| 12 | [12-testing-verification.md](agent-rules/12-testing-verification.md) | Happy path + edge case rules |
| 13 | [13-autonomy-boundaries.md](agent-rules/13-autonomy-boundaries.md) | Auto-allowed / confirm-first / never-auto |
| 14 | [14-design-system.md](agent-rules/14-design-system.md) | Colors, tokens, DS1–DS4, card templates |
| 15 | [15-shared-components-ui-modules.md](agent-rules/15-shared-components-ui-modules.md) | Component library + mandatory module map |
| 16 | [16-multi-system-architecture.md](agent-rules/16-multi-system-architecture.md) | /store vs /admin boundaries |
| 17 | [17-mobile-native-app-style.md](agent-rules/17-mobile-native-app-style.md) | M1–M5, cards, touch, jitter prevention |
| 18 | [18-multi-domain-rules.md](agent-rules/18-multi-domain-rules.md) | getSiteUrl, brand, OG meta, no hardcoded domains |
| 19 | [19-navigation-state-restoration.md](agent-rules/19-navigation-state-restoration.md) | N1–N3, scroll/tab persistence |
| 20 | [20-error-diagnostics-matrix.md](agent-rules/20-error-diagnostics-matrix.md) | Copy-pasted error → instant fix matrix |
| 21 | [21-cloudflare-supabase-api-usage.md](agent-rules/21-cloudflare-supabase-api-usage.md) | API-only ops, curl recipes, self-tests |
| 22 | [22-credentials-management.md](agent-rules/22-credentials-management.md) | CRED1, VERCEL1, env-backups structure |
| 23 | [23-code-architecture-modularity.md](agent-rules/23-code-architecture-modularity.md) | O1 — one file per modal/tab, 500-line limit |
| 24 | [24-vercel-build-security.md](agent-rules/24-vercel-build-security.md) | V1 — safe client init, no `!` assertions |
| 25 | [25-ai-seo-copywriting-engine.md](agent-rules/25-ai-seo-copywriting-engine.md) | AI1 — vision + copywriting models |
| 26 | [26-project-reference-table.md](agent-rules/26-project-reference-table.md) | All store refs, zone IDs, secrets, URLs |

## 🔗 External Docs (unchanged locations)
- `docs/SCHEMA_CHANGE_LOG.md` — every DB change, dated
- `docs/STORE_GUIDE.md` — GitHub & Supabase credentials
- `docs/CLOUDFLARE_SUPABASE_SETUP.md` — cache rules, webhooks, ISR guide, 1-click setup scripts
- `docs/STORE_TESTING_GUIDE.md` — cache & webhook test commands
- `docs/NEW_PROJECT_SETUP_GUIDE.md` — full clone & deploy guide (incl. `#agent-automation--full-setup-flow`)
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
