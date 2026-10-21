'use client';

import { useState, useEffect } from 'react';

export interface TrackingTimelineEvent {
  datetime?: string;
  createdDatetime?: string;
  modifiedDatetime?: string;
  transactionStatusMessage?: string;
}

export interface LiveTrackingData {
  ok: boolean;
  trackingNumber: string;
  rawStatus: string;
  cleanStatus: string;
  timeline: TrackingTimelineEvent[];
  recipient?: {
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  payment?: {
    codAmount?: number;
  };
  courier: {
    name: string;
    trackingUrl: string;
  };
  lastSyncedAt: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes client cache

/**
 * High-performance client-side PostEx live tracking hook with:
 * 1. 5-minute browser sessionStorage caching (0 network / 0 DB / 0 Vercel load on tab clicks)
 * 2. Automatic Cloudflare edge cache proxy (/api/track)
 * 3. Graceful fallback to stored order status if offline
 */
export function usePostExLiveTracking(trackingNumber?: string | null) {
  const [data, setData] = useState<LiveTrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cn = (trackingNumber || '').trim();
    if (!cn) {
      setData(null);
      setLoading(false);
      return;
    }

    const cacheKey = `postex_track_v1_${cn}`;

    // 1. Try reading from sessionStorage
    try {
      if (typeof window !== 'undefined') {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
          const isDelivered = parsed.data?.cleanStatus === 'DELIVERED';
          if (isFresh || isDelivered) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }

    // 2. Fetch from edge-cached serverless proxy
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/track?cn=${encodeURIComponent(cn)}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Tracking details unavailable');
        return res.json();
      })
      .then((resData: LiveTrackingData) => {
        if (cancelled) return;
        setData(resData);
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ data: resData, timestamp: Date.now() })
            );
          }
        } catch {
          // Ignore storage write errors
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message || 'Failed to load live tracking');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  return { data, loading, error };
}
