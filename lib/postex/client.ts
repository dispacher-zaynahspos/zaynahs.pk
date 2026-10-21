import { PostExOrderDist } from './types';

const POSTEX_INTEGRATION_BASE = 'https://api.postex.pk/services/integration/api';

export class PostExClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.POSTEX_MERCHANT_TOKEN || '';
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      token: this.token,
    };
  }

  /**
   * BULK SYNC: Fetches ALL merchant orders in 1 single HTTP request.
   * Call this from cron jobs or manual refresh (0 N+1 overhead).
   */
  async getAllOrders(startDate?: string, endDate?: string): Promise<PostExOrderDist[]> {
    if (!this.token) return [];
    const now = new Date();
    const end = endDate || new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    const past = new Date(now.getTime() - 90 * 86400000);
    const start = startDate || past.toISOString().split('T')[0];

    try {
      const url = `${POSTEX_INTEGRATION_BASE}/order/v1/get-all-order?startDate=${start}&endDate=${end}&orderStatusId=0`;
      const res = await fetch(url, {
        headers: this.headers(),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.dist)) {
          return data.dist;
        }
      }
    } catch (err: unknown) {
      console.error('[PostEx] getAllOrders failed:', (err as Error)?.message || err);
    }
    return [];
  }

  /**
   * HIGH-FIDELITY TRACK: Queries the public tracking portal or fallback merchant API.
   * Runs server-side to bypass browser CORS blocks and cache at edge.
   */
  async trackSingleOrder(trackingNumber: string): Promise<{
    statusCode: number | string;
    dist?: PostExOrderDist;
    statusMessage?: string;
  }> {
    const cleanCN = (trackingNumber || '').trim();
    if (!cleanCN) return { statusCode: 400, statusMessage: 'Tracking number missing' };

    // 1. Try public serverless tracking endpoint (most up to date, full timeline)
    try {
      const pubRes = await fetch('https://postex.pk/api/tracking-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; StorefrontTracking/1.0)',
        },
        body: JSON.stringify({ trackingNumber: cleanCN }),
        signal: AbortSignal.timeout(8000),
      });

      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData && (pubData.statusCode === 200 || pubData.statusCode === '200')) {
          return pubData;
        }
      }
    } catch (e: unknown) {
      console.warn('[PostEx] Public track failed, trying merchant API fallback:', (e as Error)?.message || e);
    }

    // 2. Fallback to merchant integration track-order endpoint
    if (this.token) {
      try {
        const res = await fetch(`${POSTEX_INTEGRATION_BASE}/order/v1/track-order/${encodeURIComponent(cleanCN)}`, {
          headers: this.headers(),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData && (resData.statusCode === 200 || resData.statusCode === '200')) {
            return resData;
          }
        }
      } catch (err: unknown) {
        console.error('[PostEx] Merchant track-order failed:', (err as Error)?.message || err);
      }
    }

    return { statusCode: 404, statusMessage: 'Tracking information not found' };
  }

  /**
   * SHIPPER ADVICE: Resolve delivery issues (Retry = 2, Return = 1)
   */
  async submitShipperAdvice(trackingNumber: string, statusId: 1 | 2, remarks: string) {
    const url = `${POSTEX_INTEGRATION_BASE}/order/v2/save-shipper-advice`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify({ trackingNumber, statusId, remarks }),
      signal: AbortSignal.timeout(10000),
    });
    return res.json();
  }
}
