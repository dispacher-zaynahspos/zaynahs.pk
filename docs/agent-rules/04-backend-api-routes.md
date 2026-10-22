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

## RULE ABUSE1 — Frictionless Human Bot & Abuse Shield
1. **Zero Human Friction**: Real human shoppers must NEVER be presented with captchas, puzzles, or false-positive rate-limit blocks. All checks must fail-open on unexpected errors.
2. **Invisible Honeypot**: Order forms include an offscreen hidden field (`website_url_hp`) with `tabIndex={-1}`, `opacity: 0`, and `pointer-events: none`. Automated bots filling this field are dropped in <0.1ms prior to any database queries or mutations.
3. **Speed Entropy**: Real human users take >700ms to read and interact with checkout. Instantaneous programmatic submissions are rejected.
4. **Burst Limiting**: Sliding window rate-limiting per client IP and PK phone number is capped generously (15 orders/5 min window) to permit real buyers while blocking massive script attacks.

## RULE ABUSE2 — Every public write endpoint is rate-limited (STRICT)
Never ship a public `POST`/`GET` route that writes rows, sends messages, or spends
third-party quota without a limiter. Use the ONE shared limiter — never hand-roll a Map.

```ts
import { checkRateLimit, getClientIp, tooManyRequests } from '@/lib/security/abuseProtection';

const rl = checkRateLimit(`contact:${await getClientIp()}`, { max: 5, windowMs: 3_600_000 });
if (!rl.allowed) return tooManyRequests(rl.retryAfter);   // 429 + Retry-After
```

Baseline budgets (raise only with a reason): contact **5/h**, reviews/submit **5/h**,
abandoned-cart upsert + mark-ordered **40/min**, tracking lookup **60/min**
(protects the PostEx quota). Limits are per server instance (in-memory) — the first
wall, never a replacement for RLS ([32-security-public-data-lock.md](32-security-public-data-lock.md)).

Also: any route that spends external quota or renders server config (e.g.
`/api/seo/test`, `email-templates/[type]/preview`) MUST call `requireAdmin(request)`
first. Public-by-design exceptions (keep open): `/api/indexnow/key` (IndexNow requires
it), `/api/google-verify`, `/api/admin/login`, `/api/track` (rate-limited).

## Feature implementation workflow (always in this order)
1. SQL migration → `supabase/migrations/`
2. Update `SUPER_MASTER_SCHEMA.sql` (keep in sync — see [05-database-supabase.md](05-database-supabase.md))
3. Update `lib/types.ts` (TypeScript interfaces)
4. Services → CRUD in `lib/services/`
5. Hooks → React hooks in `lib/hooks/`
6. UI component — mobile-first, follow design rules ([14-design-system.md](14-design-system.md))
7. Update `docs/SCHEMA_CHANGE_LOG.md` — document everything

