import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Always use production API for token validation (get-merchant-address, get-order-types)
// — matches Zaynahs Courier Manger behaviour exactly (postexApi.ts always uses POSTEX_HOST = 'https://api.postex.pk')
// Mode only affects create-order in the dispatch route, not token validation.
const POSTEX_BASE = 'https://api.postex.pk/services/integration/api';

function headers(token: string) {
  return {
    token,
    'Content-Type': 'application/json',
  };
}

/** Extract addresses array from PostEx API response — handles both `dist` and `data` field names */
function extractAddresses(body: Record<string, unknown>): unknown[] | null {
  const dist = body.dist;
  const data = body.data;
  if (Array.isArray(dist) && dist.length > 0) return dist;
  if (Array.isArray(data) && data.length > 0) return data;
  // Single address object wrapped in an envelope
  if (dist && typeof dist === 'object' && (dist as Record<string, unknown>).addressCode) return [dist];
  if (data && typeof data === 'object' && (data as Record<string, unknown>).addressCode) return [data];
  return null;
}

/** Extract string array from PostEx list endpoint */
function extractList(body: Record<string, unknown>): string[] | null {
  if (Array.isArray(body.dist)) return body.dist as string[];
  if (Array.isArray(body.data)) return body.data as string[];
  return null;
}

/** Check whether PostEx response indicates success */
function isSuccess(body: Record<string, unknown>): boolean {
  const code = body.statusCode;
  return code === 200 || code === '200' || code === '0200';
}

export async function POST(req: NextRequest) {
  const _denied = await requireAdmin(req);
  if (_denied) return _denied;
  try {
    const { apiToken } = await req.json();

    if (!apiToken) {
      return NextResponse.json({ success: false, error: 'API token is required' }, { status: 400 });
    }

    // Fetch merchant addresses (always production API — matches Zaynahs project behaviour)
    const addrRes = await fetch(`${POSTEX_BASE}/order/v1/get-merchant-address`, {
      method: 'GET',
      headers: headers(apiToken),
    });

    const addrData = await addrRes.json() as Record<string, unknown>;

    if (!isSuccess(addrData) && !extractAddresses(addrData)) {
      return NextResponse.json({
        success: false,
        error: addrData.statusMessage || addrData.message || addrData.error || 'Invalid token or API error',
        details: addrData,
      }, { status: 200 });
    }

    const addresses = extractAddresses(addrData);

    if (!addresses) {
      return NextResponse.json({
        success: false,
        error: addrData.statusMessage || addrData.message || 'No addresses returned — token may be invalid',
        details: addrData,
      }, { status: 200 });
    }

    // Try to fetch order types
    let orderTypes: string[] = [];
    try {
      const typesRes = await fetch(`${POSTEX_BASE}/order/v1/get-order-types`, {
        method: 'GET',
        headers: headers(apiToken),
      });
      const typesData = await typesRes.json() as Record<string, unknown>;
      const list = extractList(typesData);
      if (list) orderTypes = list;
    } catch {
      // Order types are optional
    }

    return NextResponse.json({
      success: true,
      addresses,
      orderTypes,
      message: addrData.statusMessage || addrData.message || 'Token valid',
    });
  } catch (err: unknown) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Could not reach PostEx API',
    }, { status: 200 });
  }
}
