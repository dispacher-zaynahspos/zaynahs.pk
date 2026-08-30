# 04 — Backend Rules (Node.js / API Routes)

- Every API route: input validation + try/catch + proper status codes.
- Business logic (stock, orders, payments) must run in atomic operations.
- Sensitive actions (refund, stock adjust, delete) must be logged.
- Rate limiting + auth check on every protected route.

## Standard error-handling pattern for all service functions
```ts
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[products] getProducts failed:', error);
    throw error;
  }
};
```

## RULE E1 — Server Action error unmasking
See [02-error-detection-autofix.md](02-error-detection-autofix.md) — all mutating Server Actions use the `safeAction()` / `SafeResult` pattern, never raw `throw`.

## Feature implementation workflow (always in this order)
1. SQL migration → `supabase/migrations/`
2. Update `SUPER_MASTER_SCHEMA.sql` (keep in sync — see [05-database-supabase.md](05-database-supabase.md))
3. Update `lib/types.ts` (TypeScript interfaces)
4. Services → CRUD in `lib/services/`
5. Hooks → React hooks in `lib/hooks/`
6. UI component — mobile-first, follow design rules ([14-design-system.md](14-design-system.md))
7. Update `docs/SCHEMA_CHANGE_LOG.md` — document everything
