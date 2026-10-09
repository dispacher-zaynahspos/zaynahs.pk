import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { 
  getAllAbandonedCarts, 
  deleteMultipleAbandonedCarts, 
  clearAbandonedCarts 
} from '@/lib/services/abandonedCarts';

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

export async function DELETE(req: NextRequest) {
  const _denied = await requireAdmin(req);
  if (_denied) return _denied;
  try {
    const body = await req.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      await deleteMultipleAbandonedCarts(body.ids);
      return NextResponse.json({ success: true, count: body.ids.length });
    }
    if (body.all) {
      const res = await clearAbandonedCarts({ anonymousOnly: body.anonymousOnly === true });
      return NextResponse.json({ success: true, count: res.count });
    }
    return NextResponse.json({ error: 'Missing ids or all flag' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
