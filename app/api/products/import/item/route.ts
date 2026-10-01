import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { importSingleProductCore } from '../importCore';

export const maxDuration = 60; // Max duration for a single product import

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const { product, strategy = 'skip', categoryCache = {} } = body;

    if (!product || !product.name) {
      return NextResponse.json({ error: 'Invalid product data' }, { status: 400 });
    }

    const result = await importSingleProductCore(product, strategy, categoryCache);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Import Item API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        productName: 'Unknown',
        status: 'error',
        error: err.message || 'Import failed'
      },
      { status: 500 }
    );
  }
}
