# AGENT LOG

Newest first. One line per change + files touched. Every task appends here (RULE 13, Definition of Done).

## 2026-11-06
- **Structure batch 1 (required moves):** `store/` → `lib/store/`, `hooks/` → `lib/hooks/` (13 imports updated) — `lib/store/cartStore.ts`, `lib/store/searchStore.ts`, `lib/hooks/usePostExCityFetcher.ts`.
- **Brand layer:** `lib/brand/{types,registry,resolve}.ts` — env-driven registry, host→brand resolver (store/admin/img hosts), `lib/config/domains.ts` now delegates (single entry point).
- **Audit batch 2:** removed foreign Supabase project refs from email samples + hero default; generic phone/email placeholders; env-missing now throws instead of fake client — `app/api/email-templates/[type]/{preview,send-test}/route.ts`, `components/admin/customizer/sections/HeroBannerSettings.tsx`, `lib/constants/headerAnnouncementFields.ts`, `app/admin/login/page.tsx`, `app/admin/forgot-password/page.tsx`, `app/api/upload-image/route.ts`, `app/api/cache-thumbnail/route.ts`.
- **Snapshot safety net:** `scripts/snapshot.mjs` + `npm run snapshot` / `snapshot:compare`; baseline captured for 14 routes, two consecutive runs = **0 differences**.
- **Verification:** `tsc --noEmit` 0 errors; `npm run build` ✓ (compiled + 74/74 pages); fake-brand dry run (`example.test`) resolved with zero code edits.
- **Deferred:** `lib/platform/` (needs CF bindings — Step 4), brand color token batch (`#e94560` ×1421 — needs own snapshot batch).
- **Rules:** added universal-codebase ruleset — `docs/agent-rules/35-universal-codebase-structure.md`, `AGENTS.md` (index row + “where to find what”).
- **Docs:** created living docs set — `docs/ARCHITECTURE.md`, `docs/CACHE-AND-REVALIDATION.md`, `docs/DEPLOY-CLOUDFLARE.md`, `docs/ENV.md`, `docs/BRANDS.md`, `docs/AGENT-LOG.md` + folder READMEs.
- **Separation scaffold:** worker role resolver + role gate in middleware — `lib/config/worker-role.ts`, `middleware.ts`.
- **Config generator:** per-brand Wrangler config from env, zero hardcoded domains — `scripts/gen-worker-config.mjs`, `package.json` (`worker:config`), `.gitignore` (`worker-config/`, `.dev.vars*`).
- **Plan:** Workers migration + separation plan — `docs/CLOUDFLARE_WORKERS_SEPARATION_PLAN.md`.
