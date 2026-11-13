import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  isAdminWorkerEntry,
  isBlockedOnStoreWorker,
  resolveWorkerRole,
} from '@/lib/config/worker-role';

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
  const { pathname } = req.nextUrl;

  // Google Site Verification auto-responder (e.g. /googleac32472c67f64130.html or /googleac32472c67f64130)
  if (/^\/google[a-z0-9]+(\.html)?$/i.test(pathname)) {
    const code = pathname.replace(/^\//, '').replace(/\.html$/, '');
    return new NextResponse(`google-site-verification: ${code}.html`, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // --- Worker role gate (universal separation) -------------------------------
  // WORKER_ROLE is set per deployment in the generated Wrangler config.
  // Unset (Vercel / local dev / single Worker) resolves to `all` → no change.
  const role = resolveWorkerRole({ host: req.headers.get('host') });

  // Admin Worker: the bare admin host belongs to the admin app.
  if (role === 'admin' && isAdminWorkerEntry(pathname)) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Store Worker: the admin surface is not part of this deployment.
  if (role === 'store' && isBlockedOnStoreWorker(pathname)) {
    const notFound = new NextResponse(null, { status: 404 });
    notFound.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return notFound;
  }

  const res = NextResponse.next();
  const isAdminSurface = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminSurface) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  // --- Canonical host is owned by EXACTLY ONE layer: the Vercel domain-level
  // redirect (apex -> www, matching NEXT_PUBLIC_SITE_URL=https://www.<domain>).
  // We deliberately do NOT emit any host redirect here. A previous www->apex
  // 301 in this file fought the Vercel apex->www redirect and produced an
  // infinite loop (ERR_TOO_MANY_REDIRECTS); the 301 also got cached hard by
  // Cloudflare/browsers. Single-owner canonicalization = no ping-pong.
  // See docs/agent-rules/18-multi-domain-rules.md. ---

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
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return redirectRes;
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
  // Host canonicalization is handled at the Vercel domain layer, so middleware
  // only needs to run on the admin UI (auth gate + Supabase session refresh).
  // Scoping to /admin avoids running the edge auth check on every storefront
  // request and removes any chance of a middleware-emitted host/redirect loop.
  //
  // `/` is included solely so the admin Worker can redirect the bare admin host
  // to /admin. In `all` mode (Vercel) it is a plain pass-through.
  matcher: ['/', '/admin', '/admin/:path*'],
};
