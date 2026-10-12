import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface ShippingMethodRow {
  id: string;
  name: string;
  cost: number | string | null;
  estimated_days?: string | null;
  active: boolean;
  sort_order?: number | null;
  created_at: string;
}

interface PaymentMethodRow {
  id: string;
  name: string;
  code: string;
  active: boolean;
  instructions?: string | null;
  sort_order?: number | null;
  created_at: string;
}

interface ShippingZoneRow {
  id: string;
  name: string;
  cities: unknown;
  cost: number | string | null;
  free_threshold?: number | string | null;
  estimated_days?: string | null;
  is_default?: boolean | null;
  active?: boolean | null;
  sort_order?: number | null;
  created_at: string;
}

export async function GET() {
  try {
    const [shipRes, payRes, zoneRes] = await Promise.all([
      supabaseAdmin
        .from('shipping_methods')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabaseAdmin
        .from('payment_methods')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabaseAdmin
        .from('shipping_zones')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
    ]);

    const shippingMethods = ((shipRes.data || []) as ShippingMethodRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      cost: Number(r.cost) || 0,
      estimated_days: r.estimated_days,
      active: r.active,
      sort_order: r.sort_order ?? 0,
      created_at: r.created_at,
    }));

    const paymentMethods = ((payRes.data || []) as PaymentMethodRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      active: r.active,
      instructions: r.instructions,
      sort_order: r.sort_order ?? 0,
      created_at: r.created_at,
    }));

    const shippingZones = ((zoneRes.data || []) as ShippingZoneRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      cities: Array.isArray(r.cities) ? r.cities : [],
      cost: Number(r.cost) || 0,
      free_threshold: r.free_threshold != null ? Number(r.free_threshold) : null,
      estimated_days: r.estimated_days || undefined,
      is_default: !!r.is_default,
      active: !!r.active,
      sort_order: r.sort_order ?? 0,
      created_at: r.created_at,
    }));

    return NextResponse.json(
      {
        shippingMethods,
        paymentMethods,
        shippingZones,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('[api/checkout-methods] fetch error:', err);
    return NextResponse.json(
      {
        shippingMethods: [
          {
            id: 'fallback',
            name: 'Standard Delivery',
            cost: 200,
            estimated_days: '3–5 business days',
            active: true,
            sort_order: 0,
            created_at: '',
          },
        ],
        paymentMethods: [
          {
            id: 'cod-fallback',
            name: 'Cash on Delivery',
            code: 'cod',
            active: true,
            sort_order: 0,
            created_at: '',
          },
        ],
        shippingZones: [],
      },
      { status: 200 }
    );
  }
}
