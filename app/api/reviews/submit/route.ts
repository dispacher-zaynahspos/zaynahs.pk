import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, customerName, contact, customerPhone, customerEmail, rating, comment, images } = body;

    if (!productId || !customerName || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const rawContact = (contact || customerEmail || customerPhone || '').trim();
    const isEmail = rawContact.includes('@');
    const finalPhone = !isEmail && rawContact ? rawContact : (customerPhone || null);
    const finalEmail = isEmail ? rawContact : (customerEmail || null);

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: customerName,
        customer_phone: finalPhone,
        customer_email: finalEmail,
        rating: Number(rating),
        comment: comment || null,
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        approved: false
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      review: {
        id: data.id,
        productId: data.product_id,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email,
        rating: data.rating,
        comment: data.comment,
        approved: data.approved,
        hidden: data.hidden,
        images: data.images || [],
        createdAt: data.created_at
      }
    });
  } catch (error: any) {
    console.error('[Submit Review API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
