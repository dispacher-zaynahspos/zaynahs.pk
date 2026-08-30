# 26 — Project Reference Table (All Stores)

Cross-check this before ANY multi-store operation (purge, webhook, migration, credential rotation).

| Project | Supabase Ref | Cloudflare Zone ID | Site URL | REVALIDATE_SECRET | VERCEL_PROJECT_NAME |
|---------|-------------|------------|----------|--------------------|----------------------|
| TotVogue | `ziucrfpebpxijqhwmqre` | `e4aceeacdc4f6a1677e92823df1651fd` | www.totvogue.pk | `zaynahs_secret_cache_revalidate_2026` | `zaynahsestore-tv` |
| Zaynahs | `unfdpfmjqljbjydgsccr` | `10d964449186f64d7896f8dcac4e5eff` | www.zaynahs.pk | `zaynahs_secret_cache_revalidate_2026` | `zaynahsestore-tv-main` |
| MiniMahal | `mgwkcumurrllhpjvfezz` | `6acd493022cd0f2d5a9c290088b5327a` | www.minimahal.com | `zaynahs_secret_cache_revalidate_2026` | `mini-mahal-e-store` |
| LittleMister | `ljknmwianiswkalifueb` | `063a3d5c72d44b3654aa60b17ed94863` | www.littlemister.pk | `zaynahs_secret_cache_revalidate_2026` | `eestore` |

## Rules governing this table
- `REVALIDATE_SECRET` is the ONLY value shared across all stores — see RULE D8, [05-database-supabase.md](05-database-supabase.md).
- Every other credential (Supabase ref/keys, Cloudflare zone/token, Vercel project name, GitHub token, site URL) MUST be unique per store — see RULE CRED1, [22-credentials-management.md](22-credentials-management.md).
- Credentials live in `env-backups/<store>.env.local`, never hardcoded in source — see RULE 8 / D6b, [22-credentials-management.md](22-credentials-management.md) and [05-database-supabase.md](05-database-supabase.md).
- Multi-project push chain and post-deploy purge: [00-prime-directives.md](00-prime-directives.md) and [07-deployment-vercel-cloudflare.md](07-deployment-vercel-cloudflare.md).
- Cloudflare/Supabase API command reference (using this table's values): [21-cloudflare-supabase-api-usage.md](21-cloudflare-supabase-api-usage.md).

## Notes
- `minioutfits` appears in the mandatory git-push chain (`git push minioutfits main`) but has no ref/zone/URL row in the source document — flag this to the user if a real deploy target is needed for it; do not invent values.
- Related project docs live at (paths as authored, Mac-style, kept for traceability): `Zaynahs e-store/docs/*` and `zaynahsestore-tv-main/docs/*`. Treat these as logical doc names — resolve actual paths in the current repo rather than assuming a specific OS path.
