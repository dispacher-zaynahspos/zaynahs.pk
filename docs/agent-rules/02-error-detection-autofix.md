# 02 — Error Detection & Auto-Fix Rules

- Build/lint/type errors: auto-detect → identify root cause → fix → re-run to verify.
- Runtime errors (console, server logs, Vercel logs, Supabase logs): monitor and fix proactively.
- After any fix, automatically run build/test BEFORE marking the task "done".
- Before a destructive or uncertain fix: explain first, then proceed.
- Track recurring error patterns in `ERRORLOG.md` (pattern + fix).

> For the copy-pasted-error → instant-fix diagnostic matrix (ChunkLoadError, PGRST204, hydration errors, RLS violations, etc.) see [20-error-diagnostics-matrix.md](20-error-diagnostics-matrix.md).

## RULE E1 — Server Component Error Unmasking (Safe Actions)
- **Problem**: Next.js App Router aggressively masks thrown errors in Server Actions (`use server`) in production. `throw new Error('Missing column')` only surfaces to the client as "An error occurred in the Server Components render."
- **Solution**: ALL mutations (Create/Update/Delete) in Server Actions MUST use the `SafeResult` pattern instead of throwing.
- Every mutating server function must be wrapped with `safeAction()` from `@/lib/utils/serverAction` (or an equivalent pattern).
  ```ts
  export const updateCategorySafe = async (id, data) => safeAction(updateCategory(id, data));
  ```
- On the frontend, after calling a safe server action, always check the result flag:
  ```ts
  const result = await mySafeAction();
  if (!result.success) throw new Error(result.error);
  ```
- This ensures the real `error.message` is serialized and rendered in toast notifications instead of being swallowed.
