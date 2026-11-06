# docs/ — living documentation

## Purpose
Everything a human or agent needs that is not code. Docs here are **kept current**
(RULE 35 §7) — a change that alters structure, flow, env or deploy updates the doc
in the same task.

## Start here
| File | Read it when |
|---|---|
| `ARCHITECTURE.md` | before any structural work |
| `CACHE-AND-REVALIDATION.md` | touching caching, ISR, admin saves, webhooks |
| `DEPLOY-CLOUDFLARE.md` | deploying, migrating platform, rollback |
| `ENV.md` | adding/renaming a variable |
| `BRANDS.md` | adding a brand or brand config |
| `AGENT-LOG.md` | what changed recently, newest first |
| `agent-rules/` | the permanent rules (indexed from `AGENTS.md`) |

## Belongs here
- Living docs (above), agent rules, guides, UI specs, migration plans, prompts.

## Does not belong here
- Secrets, real credentials, exported env files
- Generated artefacts (worker configs live in git-ignored `worker-config/`)
