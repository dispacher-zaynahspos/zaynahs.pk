import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/services/products';

export const dynamic = 'force-dynamic';

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'blue-kurtis-batik-tie-dye-panels-red-piping-wide-cuffs-1';
  try {
    const product = await getProductBySlug(slug);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
