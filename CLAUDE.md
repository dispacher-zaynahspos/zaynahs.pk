@AGENTS.md

---

## 🔑 Cloudflare + Supabase API Rule (MANDATORY)

- ALL Cloudflare token verification, cache purge, Supabase webhook trigger creation → via API/curl only
- NEVER ask user to do manual dashboard steps when API exists
- `cfk_` tokens = INVALID for Bearer auth → always warn + guide to create `cfut_` API Token
- After every setup change → run live webhook test + trigger URL verification
- All 4 projects: TotVogue(totvogue.pk), Zaynahs(zaynahs.pk), MiniMahal(minimahal.com), LittleMister(littlemister.pk)
- Credentials: `env-backups/*.env.local` — never use wrong project's credentials
