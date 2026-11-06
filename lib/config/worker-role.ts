/**
 * Worker role resolution — universal, zero hardcoded domains.
 *
 * A single codebase can be deployed as up to three things:
 *   - `store` Worker  → public storefront host (e.g. www.<domain>)
 *   - `admin` Worker  → admin host (e.g. admin.<domain>)
 *   - `all`           → one deployment serving both (Vercel, local dev, single Worker)
 *
 * Resolution order:
 *   1. WORKER_ROLE env  (set per Worker in the generated wrangler config)
 *   2. `admin.` host prefix (safety net if env is missing)
 *   3. `all`
 *
 * When WORKER_ROLE is unset (today's Vercel deployment) `all` is returned and
 * no behaviour changes anywhere.
 */

export type WorkerRole = 'store' | 'admin' | 'all';

const ADMIN_HOST_PREFIX = 'admin.';

function normalizeHost(rawHost: string | null | undefined): string {
  if (!rawHost) return '';
  return rawHost
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

function normalizeRole(rawRole: string | null | undefined): WorkerRole | null {
  const role = (rawRole || '').trim().toLowerCase();
  if (role === 'store' || role === 'admin' || role === 'all') return role;
  return null;
}

/**
 * @param host   request host header (optional — falls back to env heuristics)
 * @param envRole explicit override (defaults to process.env.WORKER_ROLE)
 */
export function resolveWorkerRole(opts?: {
  host?: string | null;
  envRole?: string | null;
}): WorkerRole {
  const fromEnv = normalizeRole(
    opts?.envRole !== undefined ? opts.envRole : process.env.WORKER_ROLE
  );
  if (fromEnv) return fromEnv;

  const host = normalizeHost(opts?.host);
  if (host.startsWith(ADMIN_HOST_PREFIX)) return 'admin';

  return 'all';
}

/** Any path that belongs to the admin surface (UI + admin APIs). */
export function isAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/api/admin' ||
    pathname.startsWith('/api/admin/')
  );
}

/**
 * The store Worker must never serve the admin surface.
 * Auth callback routes are shared (they are harmless and are not admin UI).
 */
export function isBlockedOnStoreWorker(pathname: string): boolean {
  return isAdminPath(pathname);
}

/** The admin Worker owns only `/admin` (everything else is public/redirect). */
export function isAdminWorkerEntry(pathname: string): boolean {
  return pathname === '/' || pathname === '';
}
