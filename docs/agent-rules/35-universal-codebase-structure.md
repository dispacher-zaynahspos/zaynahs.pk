# 35 — Universal Codebase, Structure & Agent Workflow

Status: **active**. Applies to every task in this repo.
Index rule IDX1 still governs placement: rule bodies live here, `AGENTS.md` only links.

---

## 1. READ FIRST, UPDATE AFTER

- Before any task: read `AGENTS.md` and `docs/ARCHITECTURE.md`.
- After any task: update both if the work changed structure, flow or rules.
- Definition of Done includes docs + `docs/AGENT-LOG.md` entry — see §13.

## 2. WHERE TO FIND WHAT

`AGENTS.md` carries a short "where to find what" table (topic → folder/file). Keep it
current whenever a top-level folder or ownership boundary changes.

## 3. STRUCTURE BY AREA, NOT BY FILE TYPE

One clear home per concern:

| Area | Home |
|---|---|
| Brand config | `lib/brand/` (registry + resolver) |
| Store pages | `app/(store)/` |
| Admin pages | `app/admin/` |
| API routes | `app/api/` |
| Shared UI | `components/common/` |
| Store UI | `components/store/` |
| Admin UI | `components/admin/` |
| Product card | `components/product-cards/` |
| Server logic | `lib/services/` |
| Database access | `lib/supabase/` |
| Cache + revalidation | `lib/revalidate.ts`, `app/api/revalidate/` |
| Platform adapters (CF/Vercel) | `lib/platform/` (single folder only) |
| Scripts | `scripts/` |
| Docs | `docs/` |

Platform-specific differences never leak into feature code: feature code calls the
adapter, the adapter knows the platform.

## 4. NAMING

- Folders lowercase, descriptive, kebab-case when multi-word.
- File name says what the file does (`revalidate.ts`, not `helpers.ts`).
- Banned: `utils2`, `temp`, `new`, `final`, `misc`, `copy`, `old`.
- One concept = one name in code, docs and database.

## 5. SIZE AND CLARITY

- One responsibility per file; split before it stops being readable in one sitting.
- No dead code, no duplicate logic, no commented-out blocks.
- Comments explain **why**, not what.
- Reuse beats rewrite — check `docs/agent-rules/27-single-source-of-truth.md` first.

## 6. FOLDER README

Every main folder has a short `README.md`: purpose, what belongs here, what does not.

## 7. DOCS THAT STAY CURRENT

| File | Contents |
|---|---|
| `docs/ARCHITECTURE.md` | folder tree, request flow, data flow |
| `docs/CACHE-AND-REVALIDATION.md` | what is cached where, what an admin save refreshes |
| `docs/DEPLOY-CLOUDFLARE.md` | build, deploy, rollback |
| `docs/ENV.md` | variable names, purpose, brand/platform, secret — **never values** |
| `docs/BRANDS.md` | how to add a brand |
| `docs/AGENT-LOG.md` | dated one-line changes, newest first, files touched |

## 8. NO HARDCODING

No domain, brand name, logo, ID, API key, phone, email, address, social link or
brand-specific text inside code. Everything brand-specific comes from:

1. brand config (`lib/brand/`), or
2. env with **brand-neutral** names (`SITE_URL`, not `ZAYNAHS_URL`).

Placeholder copy in forms (`e.g. 0300...`) must be generic, never a real number.

## 9. SAFE CHANGES

- Small steps. Build + snapshot comparison after each step.
- Local commit per step with a clear message.
- Renames via `git mv` so history stays readable.
- Never mass-move/rename files for looks without passing tests.

## 10. SECRETS

Never print, log, commit or copy a secret into build output, static assets or plain
Worker variables. `.env*` and `env-backups/` stay git-ignored.

## 11. ISOLATION (Zaynahs clone)

- Work in this clone only. No push to any remote.
- Zaynahs Cloudflare account/zone only.
- Shared Supabase is read-only for other brands' data.
- Before any live step: one line `TotVogue impact: none`.
- Never touch TotVogue DNS, cache rules, Vercel project, webhooks or data.

## 12. STOP POINTS

Never buy, upgrade, or make a live change to DNS / Supabase / Vercel without an
explicit user message. Say what you will do → do it → update docs.

## 13. DEFINITION OF DONE

1. It works.
2. Tests/snapshots pass (no unexplained diff).
3. Docs + `AGENTS.md` updated if affected.
4. `docs/AGENT-LOG.md` entry added.
5. No stray files, no dead code, no secret exposed.
