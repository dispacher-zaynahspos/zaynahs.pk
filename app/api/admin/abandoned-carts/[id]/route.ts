import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { deleteAbandonedCart } from '@/lib/services/abandonedCarts';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const _denied = await requireAdmin(req);
  if (_denied) return _denied;
  try {
    const { id } = await params;
    await deleteAbandonedCart(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete abandoned cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
