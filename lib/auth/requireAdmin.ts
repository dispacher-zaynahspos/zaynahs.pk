import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * SINGLE SOURCE OF TRUTH for admin authorization on API routes + server actions.
 *
 * Authorization model (matches `/api/admin/login`): a request is "admin" when it
 * carries a valid Supabase Auth session cookie AND the session email is in the
 * `NEXT_PUBLIC_ADMIN_EMAIL` allow-list. If no allow-list is configured, any
 * authenticated Supabase user is treated as admin (single-tenant fallback).
 *
 * NEVER hand-roll an inline `getUser()`/email check in a route again — call
 * `requireAdmin(req)` at the top of every privileged handler:
 *
 *   export async function POST(req: Request) {
 *     const denied = await requireAdmin(req);
 *     if (denied) return denied;              // 401/403 short-circuit
 *     ...privileged work...
 *   }
 */

/** Returns the authenticated admin user, or null if not signed in / not allow-listed. */
export async function getAdminUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = user.email?.toLowerCase() || '';
    if (allowed.length > 0 && !allowed.includes(email)) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Route guard. Returns a `NextResponse` (401/403) to return early when the caller
 * is not an admin, or `null` when authorized (continue).
 *
 * Trusted server-to-server callers (Supabase webhooks, internal jobs) may instead
 * present the `x-revalidate-secret` header matching `REVALIDATE_SECRET`.
 */
export async function requireAdmin(req?: Request): Promise<NextResponse | null> {
  const user = await getAdminUser();
  if (user) return null;

  if (req) {
    const secret = req.headers.get('x-revalidate-secret');
    if (secret && process.env.REVALIDATE_SECRET && secret === process.env.REVALIDATE_SECRET) {
      return null;
    }
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
