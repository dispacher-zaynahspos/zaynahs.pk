# 00 — Prime Directives (Rule #0, unpacked)
These are always active, on every task, no exceptions.

1. **Fulfill the request** — modify, refactor, or create exactly what is asked without hesitation.
2. **Mobile-first ALWAYS** — every single component, page, layout must be designed mobile-first. Desktop is secondary/enhancement.
3. **Direct action** — find relevant files and implement fixes directly. No asking unnecessary questions.
4. **Data integrity first** — product, stock, order data is NEVER approximated. If uncertain → throw an error instead of guessing.
5. **TypeScript strict** — every file is `.tsx` or `.ts`. No `any` types, ever.
6. **No email system** — this store uses WhatsApp only. Never suggest or implement email flows.
7. **Agent executes** — the agent runs all terminal commands autonomously. Never ask the user to run commands manually unless absolutely required.
8. **Fast & direct work** — work directly and quickly. Do not waste tokens on MCP tools, browser interactions, or reading unnecessary files. Resolve issues with direct code analysis and implementation.
9. **Product card styles & templates** — whenever creating, updating, or modifying product card styles, layout designs, swatches, badges, actions, or visual card themes, MUST strictly follow `docs/prompts/add_card_style_prompt.md` step-by-step. See also RULE DS2 in [14-design-system.md](14-design-system.md).
10. **RULE D12 — Flash sale discount & API caching** (also see [08-caching-isr-ssr.md](08-caching-isr-ssr.md) and [05-database-supabase.md](05-database-supabase.md)):
    - Flash Sale discounts (percentage or fixed) apply directly to active selling price (`product.price`), preserving `comparePrice` as original compare price (or original price if compare price was null).
    - Dynamic listing endpoints (e.g. `/api/products/list`) MUST use `Cache-Control: no-store, no-cache, must-revalidate`.
    - Every production deploy MUST trigger `node scripts/post-deploy-fix.mjs` to purge Cloudflare CDN edge cache.
    - **Agent MUST NEVER wait for the user to ask for a cache purge.** After any `git push`, run this exact synchronous bash chain (never a background timer):
      ```bash
      git push origin main; git push zaynahspk main; git push minimahal main; git push littlemister main; git push minioutfits main; sleep 240 && node scripts/post-deploy-fix.mjs
      ```

## Reference doc links used across all rule files
- `docs/SCHEMA_CHANGE_LOG.md`
- `docs/STORE_GUIDE.md` (GitHub & Supabase credentials)
- `docs/CLOUDFLARE_SUPABASE_SETUP.md` (cache rules, webhooks, ISR)
- `docs/STORE_TESTING_GUIDE.md`
- `docs/NEW_PROJECT_SETUP_GUIDE.md`
- `docs/GEMINI_AUTOMATION_GUIDE.md`
