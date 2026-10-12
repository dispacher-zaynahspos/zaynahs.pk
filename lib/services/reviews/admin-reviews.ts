'use server';

import { createClient } from '@/lib/supabase/server';
import { Review } from '@/lib/types';
import { mapReview, DBReview } from './types';
import { revalidateStorefrontEdge } from '@/lib/revalidate';
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
    
    const reviews = (data ?? []).map((row) => mapReview(row as DBReview));

    // Batch fetch product names, slugs, and images
    const productIds = reviews.map(r => r.product_id).filter(Boolean) as string[];
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
        productName: r.product_id ? productMap[r.product_id]?.name : undefined,
        productSlug: r.product_id ? productMap[r.product_id]?.slug : undefined,
        productImage: r.product_id ? imageMap[r.product_id] : undefined,
      }));
    }

    return reviews;
  } catch (error) {
    console.error('[reviews] getAllReviews failed:', error);
    throw error;
  }
};

// 3. Assign / reassign / detach a product on an existing review (orphan review recovery).
//    Passing null detaches the review (makes it a General/Store review).
//    The AFTER-trigger update_product_reviews_stats recomputes the NEW product's stats;
//    we also explicitly recompute the OLD product so its aggregates drop this review immediately.
export const assignReviewProduct = async (
  reviewId: string,
  productId: string | null
): Promise<Review> => {
  try {
    // Capture the previous product_id so we can recompute its stats after reassignment.
    const { data: prev } = await supabaseAdmin
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();
    const previousProductId: string | null = prev?.product_id ?? null;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ product_id: productId })
      .eq('id', reviewId)
      .select('*')
      .single();

    if (error) throw error;

    // Recompute the old product's aggregates (trigger only handles the row's current product_id).
    // Fault-tolerant: if the RPC isn't deployed yet (migration 20260928140000), don't fail the assign.
    if (previousProductId && previousProductId !== productId) {
      try {
        await supabaseAdmin.rpc('recompute_product_review_stats', { p_product_id: previousProductId });
      } catch (rpcErr) {
        console.error('[reviews] recompute_product_review_stats skipped (run migration 20260928140000):', rpcErr);
      }
    }

    await revalidateStorefrontEdge('reviews', 'products');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] assignReviewProduct failed:', error);
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
    
    await revalidateStorefrontEdge('reviews', 'products');
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
    
    await revalidateStorefrontEdge('reviews', 'products');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] hideShowReview failed:', error);
    throw error;
  }
};

// 8b. Store reply to a review (public reply shown under the review). Pass '' to clear.
export const replyToReview = async (id: string, reply: string): Promise<Review> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ store_reply: reply.trim() || null })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    await revalidateStorefrontEdge('reviews', 'products');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] replyToReview failed:', error);
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
    
    await revalidateStorefrontEdge('reviews', 'products');
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

    await revalidateStorefrontEdge('reviews', 'products');
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
    const reviews = (data ?? []).map((row) => mapReview(row as DBReview));

    const productIds = reviews.map(r => r.product_id).filter(Boolean) as string[];
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
        productName: r.product_id ? productMap[r.product_id]?.name : undefined,
        productImage: r.product_id ? imageMap[r.product_id] : undefined,
      }));
    }

    return reviews;
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

    await revalidateStorefrontEdge('reviews', 'products');
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

    await revalidateStorefrontEdge('reviews', 'products');
  } catch (error) {
    console.error('[reviews] hardDeleteReview failed:', error);
    throw error;
  }
};

// 10. Submit an admin custom review (manual upload). Supports photos/videos,
//     backdated date, verified/source flags. Used by the admin "Add Review" form.
export const submitAdminCustomReview = async (review: {
  productId?: string | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  rating: number;
  comment?: string;
  screenshotUrl?: string;
  images?: string[];
  createdAt?: string;
  isVerified?: boolean;
  storeReply?: string;
}): Promise<Review> => {
  try {
    const insertRow: Record<string, unknown> = {
      product_id: review.productId || null,
      customer_name: review.customerName,
      customer_phone: review.customerPhone || null,
      customer_email: review.customerEmail || null,
      rating: Math.min(5, Math.max(1, Math.round(review.rating))),
      comment: review.comment || null,
      screenshot_url: review.screenshotUrl || null,
      images: Array.isArray(review.images) ? review.images.filter(Boolean) : undefined,
      is_manual: true,
      approved: true,
      is_verified_purchase: review.isVerified ?? false,
      store_reply: review.storeReply?.trim() || null,
    };
    if (review.createdAt) insertRow.created_at = review.createdAt;
    // Drop undefined keys so DB defaults apply.
    Object.keys(insertRow).forEach((k) => insertRow[k] === undefined && delete insertRow[k]);

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(insertRow)
      .select('*')
      .single();

    if (error) throw error;

    await revalidateStorefrontEdge('reviews', 'products');

    return mapReview(data);
  } catch (error) {
    console.error('[reviews] submitAdminCustomReview failed:', error);
    throw error;
  }
};

// 11. Bulk import reviews (CSV). Each row is validated; invalid rows are skipped
//     and reported. All valid rows are inserted in one batch, then one revalidate.
export interface BulkReviewRow {
  productId?: string | null;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  isVerified?: boolean;
}

export const bulkImportReviews = async (
  rows: BulkReviewRow[],
): Promise<{ inserted: number; skipped: number; errors: string[] }> => {
  const errors: string[] = [];
  const valid: Record<string, unknown>[] = [];

  rows.forEach((r, i) => {
    const line = i + 1;
    if (!r.customerName || !r.customerName.trim()) {
      errors.push(`Row ${line}: missing customer name`);
      return;
    }
    const rating = Math.round(Number(r.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      errors.push(`Row ${line}: rating must be 1–5`);
      return;
    }
    const row: Record<string, unknown> = {
      product_id: r.productId || null,
      customer_name: r.customerName.trim(),
      rating,
      comment: r.comment?.trim() || null,
      is_manual: true,
      approved: true,
      is_verified_purchase: r.isVerified ?? false,
    };
    if (r.createdAt) {
      const d = new Date(r.createdAt);
      if (!isNaN(d.getTime())) row.created_at = d.toISOString();
    }
    valid.push(row);
  });

  if (valid.length === 0) {
    return { inserted: 0, skipped: rows.length, errors };
  }

  const { error } = await supabaseAdmin.from('reviews').insert(valid);
  if (error) {
    console.error('[reviews] bulkImportReviews failed:', error);
    throw error;
  }

  await revalidateStorefrontEdge('reviews', 'products');
  return { inserted: valid.length, skipped: rows.length - valid.length, errors };
};
