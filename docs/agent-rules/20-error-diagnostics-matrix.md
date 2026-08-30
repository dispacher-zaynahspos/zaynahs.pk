# 20 — 🚨 Strong Error Tracking & Instant Diagnostic Protocol

Whenever the user copy-pastes an error log, terminal output, stack trace, or DevTools error snippet, the agent MUST immediately map it to this diagnostic matrix, identify the root cause, and execute the exact instant fix — WITHOUT asking for permission.

## 🔍 Error Diagnostic Matrix & Instant Fix Actions

1. **`ChunkLoadError` / `404 (Not Found) _next/static/chunks/`**
   - **Root cause**: Cloudflare Edge CDN serving stale HTML pointing to hashed JS assets deleted in a new deployment.
   - **Instant fix**: Run `node scripts/post-deploy-fix.mjs` or a Cloudflare `purge_everything: true` API call, then POST to `/api/revalidate`.

2. **`PGRST204` / `Could not find the '<col>' column of '<table>' in schema cache`**
   - **Root cause**: Supabase table missing a column, or the Supabase REST schema cache needs refreshing.
   - **Instant fix**: Run DDL SQL via the Supabase Management API (`POST /v1/projects/{ref}/database/query`), sync `SUPER_MASTER_SCHEMA.sql`, re-query.

3. **`An error occurred in the Server Components render`**
   - **Root cause**: Next.js App Router masked exception in a Server Action / Server Component in production.
   - **Instant fix**: Wrap the operation in `safeAction()` from `@/lib/utils/serverAction`, or return `{ success: false, error: message }` instead of throwing a raw Error. (See RULE E1, [02-error-detection-autofix.md](02-error-detection-autofix.md).)

4. **`Hydration failed because the initial UI does not match`**
   - **Root cause**: Client-only dynamic value (`window.location`, `localStorage`, `Date.now()`, random numbers) evaluated during SSR.
   - **Instant fix**: Wrap client-only evaluation in `useEffect()` or `useState(null)` with `suppressHydrationWarning`.

5. **`Invalid API Key` / `401 Unauthorized` on `/api/revalidate`**
   - **Root cause**: Mismatched or missing `x-revalidate-secret` header.
   - **Instant fix**: Pass `x-revalidate-secret: zaynahs_secret_cache_revalidate_2026` explicitly.

6. **`TypeError: Cannot read properties of undefined (reading 'map')`**
   - **Root cause**: API/service returned `null`/`undefined` data without an array fallback.
   - **Instant fix**: `(data ?? []).map(...)`.

7. **`Database error: RLS policy violation` / `42501`**
   - **Root cause**: Query used the standard client (`supabase`) instead of the service-role admin client (`supabaseAdmin`) on an RLS-protected table.
   - **Instant fix**: `import { supabaseAdmin } from '@/lib/supabase/admin'`.

8. **`Cookie limit exceeded` / `Cookie chunking failed`**
   - **Root cause**: Auth session cookies exceeding the 4KB browser limit on mobile devices.
   - **Instant fix**: Use `createServerClient` from `@supabase/ssr` with chunked cookie response handling in `proxy.ts`.

## ⚡ Agent mandatory execution order on a copy-pasted error
1. **Direct action** — locate the target file(s) and apply the fix immediately.
2. **Compile & test** — run `npm run build` locally, verify 0 build errors.
3. **Deploy & push** — push the commit to all GitHub remotes, trigger live cache revalidation (see [00-prime-directives.md](00-prime-directives.md) for the mandatory push+purge chain).
4. **Structured report**:
   - 📌 **Error**: identified issue
   - 🔍 **Root cause**: exact explanation
   - 🛠️ **File & line**: exact code location fixed
   - 🚀 **Status**: live revalidation & build verification results
