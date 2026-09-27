import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAllAbandonedCarts } from '@/lib/services/abandonedCarts';

export async function GET() {
  const _denied = await requireAdmin();
  if (_denied) return _denied;
  try {
    const carts = await getAllAbandonedCarts();
    return NextResponse.json({ carts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
