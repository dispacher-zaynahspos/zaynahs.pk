import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side gate for the admin UI.
 *
 * Before this existed there was NO route-level protection — `app/admin/layout.tsx`
 * is a client component with no auth check, so unauthenticated users could load
 * the admin shell. API routes are separately guarded by `lib/auth/requireAdmin`;
 * this middleware adds the UI-level gate (defense in depth) + refreshes the
 * Supabase session cookie on admin navigations.
 *
 * FAIL-CLOSED: any error, or no valid session, redirects to /admin/login. A
 * security gate must never fail open.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // --- Canonical host: normalize www.* -> bare domain (301) so www and non-www
  // don't both get indexed (duplicate-content). Generic across all store domains,
  // no hardcoded host. Skips localhost/preview hosts. ---
  const host = req.headers.get('host') || '';
  if (host.startsWith('www.') && !host.includes('localhost')) {
    const target = `https://${host.slice(4)}${pathname}${req.nextUrl.search}`;
    return NextResponse.redirect(target, 301);
  }

  // Only guard the admin UI; never guard the login/auth pages or API (API uses requireAdmin).
  const isAdminUi =
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/forgot-password') &&
    !pathname.startsWith('/admin/reset-password');

  if (!isAdminUi) return res;

  const denyToLogin = (reason: string) => {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set(reason === 'not_authorized' ? 'error' : 'redirect',
      reason === 'not_authorized' ? 'not_authorized' : pathname);
    return NextResponse.redirect(loginUrl);
  };

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return denyToLogin('redirect');

    // Enforce the admin allow-list at the edge too (matches requireAdmin / login).
    const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const email = user.email?.toLowerCase() || '';
    if (allowed.length > 0 && !allowed.includes(email)) {
      return denyToLogin('not_authorized');
    }
  } catch (err) {
    // FAIL-CLOSED: on any unexpected error, send to login rather than exposing admin.
    console.warn('[middleware] admin auth check failed — denying:', err);
    return denyToLogin('redirect');
  }

  return res;
}

export const config = {
  // Run on all routes (for canonical-host redirect) except Next internals,
  // API, and files with extensions (sitemap.xml, robots.txt, images, etc.).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)'],
};
