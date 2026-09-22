'use server';

import { createClient } from '@/lib/supabase/server';
import { Review } from '@/lib/types';
import { mapReview } from './types';
import { revalidateTagSafe } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase/admin';

// 2. Fetch all reviews (admin)
export const getAllReviews = async (): Promise<(Review & { productName?: string; productImage?: string; productSlug?: string })[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const reviews = (data ?? []).map((row: any) => mapReview(row));

    // Batch fetch product names, slugs, and images
    const productIds = reviews.map(r => r.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      const [productResult, imageResult] = await Promise.all([
        supabaseAdmin.from('products').select('id, name, slug').in('id', productIds),
        supabaseAdmin.from('product_images').select('product_id, url, is_primary').in('product_id', productIds),
      ]);
      const productMap: Record<string, { name: string; slug: string }> = {};
      if (productResult.data) {
        for (const p of productResult.data) {
          productMap[p.id] = { name: p.name, slug: p.slug };
        }
      }
      const imageMap: Record<string, string> = {};
      if (imageResult.data) {
        for (const img of imageResult.data) {
          if (!imageMap[img.product_id] || img.is_primary) {
            imageMap[img.product_id] = img.url;
          }
        }
      }
      return reviews.map(r => ({
        ...r,
        productName: r.productId ? productMap[r.productId]?.name : undefined,
        productSlug: r.productId ? productMap[r.productId]?.slug : undefined,
        productImage: r.productId ? imageMap[r.productId] : undefined,
      }));
    }

    return reviews as any;
  } catch (error) {
    console.error('[reviews] getAllReviews failed:', error);
    throw error;
  }
};

// 4. Approve / Disapprove a review (admin)
export const approveReview = async (id: string, approved: boolean = true): Promise<Review> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved, hidden: false })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] approveReview failed:', error);
    throw error;
  }
};

// 8. Hide / Show an approved review (admin)
export const hideShowReview = async (id: string, hidden: boolean): Promise<Review> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ hidden })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] hideShowReview failed:', error);
    throw error;
  }
};

// 5. Delete a review (admin)
export const deleteReview = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[reviews] deleteReview failed:', error);
    throw error;
  }
};

// Delete a single review photo (moves photo into Trash without deleting review)
export const deleteSingleReviewPhoto = async (reviewId: string, photoUrl: string): Promise<void> => {
  try {
    const { data: review, error: fetchErr } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (fetchErr || !review) throw new Error('Review not found');

    const currentImages: string[] = Array.isArray(review.images) ? review.images : [];
    const updatedImages = currentImages.filter(u => u !== photoUrl);
    const updatedScreenshotUrl = review.screenshot_url === photoUrl ? null : review.screenshot_url;

    await supabaseAdmin
      .from('reviews')
      .update({
        images: updatedImages,
        screenshot_url: updatedScreenshotUrl
      })
      .eq('id', reviewId);

    // Insert record into media_library with deleted_at set to NOW so it appears in Trash Bin -> Media tab
    await supabaseAdmin
      .from('media_library')
      .insert({
        file_url: photoUrl,
        original_filename: `Review Photo (${review.customer_name})`,
        title: `Customer Review Photo`,
        alt_text: `Review photo by ${review.customer_name}`,
        bucket: 'product-images',
        file_size: 18400, // ~18 KB WebP average
        mime_type: 'image/webp',
        review_id: reviewId,
        deleted_at: new Date().toISOString()
      });

    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[reviews] deleteSingleReviewPhoto failed:', error);
    throw error;
  }
};

export const getDeletedReviews = async (): Promise<(Review & { productName?: string })[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    const reviews = (data ?? []).map((row: any) => mapReview(row));

    const productIds = reviews.map(r => r.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      const [productResult, imageResult] = await Promise.all([
        supabaseAdmin.from('products').select('id, name').in('id', productIds),
        supabaseAdmin.from('product_images').select('product_id, url, is_primary').in('product_id', productIds),
      ]);
      const productMap: Record<string, { name: string }> = {};
      if (productResult.data) {
        for (const p of productResult.data) {
          productMap[p.id] = { name: p.name };
        }
      }
      const imageMap: Record<string, string> = {};
      if (imageResult.data) {
        for (const img of imageResult.data) {
          if (!imageMap[img.product_id] || img.is_primary) {
            imageMap[img.product_id] = img.url;
          }
        }
      }
      return reviews.map(r => ({
        ...r,
        productName: r.productId ? productMap[r.productId]?.name : undefined,
        productImage: r.productId ? imageMap[r.productId] : undefined,
      }));
    }

    return reviews as any;
  } catch (error) {
    console.error('[reviews] getDeletedReviews failed:', error);
    throw error;
  }
};

export const restoreReview = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('reviews')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;

    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[reviews] restoreReview failed:', error);
    throw error;
  }
};

export const hardDeleteReview = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[reviews] hardDeleteReview failed:', error);
    throw error;
  }
};

// 10. Submit an admin custom review (with optional screenshot)
export const submitAdminCustomReview = async (review: {
  productId?: string | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  rating: number;
  comment?: string;
  screenshotUrl?: string;
}): Promise<Review> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: review.productId || null,
        customer_name: review.customerName,
        customer_phone: review.customerPhone || null,
        customer_email: review.customerEmail || null,
        rating: review.rating,
        comment: review.comment || null,
        screenshot_url: review.screenshotUrl || null,
        is_manual: true,
        approved: true
      })
      .select('*')
      .single();

    if (error) throw error;

    revalidateTagSafe('reviews');
    revalidateTagSafe('products');

    return mapReview(data);
  } catch (error) {
    console.error('[reviews] submitAdminCustomReview failed:', error);
    throw error;
  }
};
