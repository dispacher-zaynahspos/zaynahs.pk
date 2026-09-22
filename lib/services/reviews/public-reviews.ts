'use server';

import { Review } from '@/lib/types';
import { mapReview, GlobalReviewFilters } from './types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidateTagSafe } from '@/lib/revalidate';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
});

// 1. Fetch approved reviews for a product (public)
const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const { data, error } = await staticSupabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapReview);
  } catch (error) {
    console.error('[reviews] fetchProductReviews failed, returning empty fallback list:', error);
    return [];
  }
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  if (typeof window !== 'undefined') {
    return fetchProductReviews(productId);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    return unstable_cache(
      () => fetchProductReviews(productId),
      [`product-reviews-list-${productId}`],
      { revalidate: 86400, tags: [`reviews-${productId}`, 'reviews'] }
    )();
  } catch {
    return fetchProductReviews(productId);
  }
};

// 3. Submit a review (public, defaults to approved=false)
export const submitReview = async (review: {
  productId: string;
  customerName: string;
  contact?: string;
  customerPhone?: string;
  customerEmail?: string;
  rating: number;
  comment?: string;
  images?: string[];
}): Promise<Review> => {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit review');
      }
      const data = await res.json();
      return data.review;
    }

    const rawContact = (review.contact || review.customerEmail || review.customerPhone || '').trim();
    const isEmail = rawContact.includes('@');
    const customerPhone = !isEmail && rawContact ? rawContact : (review.customerPhone || null);
    const customerEmail = isEmail ? rawContact : (review.customerEmail || null);

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: review.productId,
        customer_name: review.customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        rating: review.rating,
        comment: review.comment || null,
        images: Array.isArray(review.images) ? review.images.filter(Boolean) : [],
        approved: false
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Revalidate reviews caches
    revalidateTagSafe('reviews');
    revalidateTagSafe('products');
    
    const savedReview = mapReview(data);

    // Await the email dispatch so the serverless function does not exit/freeze before delivery completes
    try {
      const { getProductById } = await import('@/lib/services/products');
      const product = await getProductById(review.productId);
      if (product) {
        const { onNewReview } = await import('@/lib/email/triggers');
        await onNewReview(savedReview, product);
      }
    } catch (err) {
      console.error('[Email Trigger] failed in submitReview trigger:', err);
    }
    
    return savedReview;
  } catch (error) {
    console.error('[reviews] submitReview failed:', error);
    throw error;
  }
};

// 6. Get average rating and count for a product
const fetchAverageRating = async (productId: string): Promise<{ average: number; count: number }> => {
  try {
    const { data, error } = await staticSupabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null);

    if (error) throw error;

    const count = data?.length ?? 0;
    if (count === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = Math.round((sum / count) * 10) / 10;

    return { average, count };
  } catch (error) {
    console.error('[reviews] fetchAverageRating failed, returning zero ratings fallback:', error);
    return { average: 0, count: 0 };
  }
};

export const getAverageRating = async (productId: string): Promise<{ average: number; count: number }> => {
  if (typeof window !== 'undefined') {
    return fetchAverageRating(productId);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    return unstable_cache(
      () => fetchAverageRating(productId),
      [`product-average-rating-${productId}`],
      { revalidate: 86400, tags: [`reviews-${productId}`, 'reviews'] }
    )();
  } catch {
    return fetchAverageRating(productId);
  }
};

// 7. Fetch top approved reviews for landing page grid
const fetchTopReviews = async (limit: number = 8): Promise<(Review & { productName?: string; productSlug?: string })[]> => {
  try {
    const { data, error } = await staticSupabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .eq('hidden', false)
      .gte('rating', 4)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const reviews = (data ?? []).map((row: any) => mapReview(row));

    const productIds = reviews.map(r => r.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name, slug')
        .in('id', productIds);
      const productMap: Record<string, { name: string; slug: string }> = {};
      if (products) {
        for (const p of products) {
          productMap[p.id] = { name: p.name, slug: p.slug };
        }
      }
      return reviews.map(r => ({
        ...r,
        productName: r.productId ? productMap[r.productId]?.name : undefined,
        productSlug: r.productId ? productMap[r.productId]?.slug : undefined,
      }));
    }

    return reviews as any;
  } catch (error) {
    console.error('[reviews] fetchTopReviews failed, returning empty fallback list:', error);
    return [];
  }
};

export const getTopReviews = async (limit: number = 8): Promise<(Review & { productName?: string; productSlug?: string })[]> => {
  if (typeof window !== 'undefined') {
    return fetchTopReviews(limit);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    return unstable_cache(
      (lim: number) => fetchTopReviews(lim),
      ['top-reviews-list'],
      { revalidate: 86400, tags: ['reviews'] }
    )(limit);
  } catch {
    return fetchTopReviews(limit);
  }
};

// 9. Fetch global reviews for the /reviews storefront page
export const getGlobalReviews = async (filters: GlobalReviewFilters = {}): Promise<{
  reviews: (Review & { productName?: string; productImage?: string; productSlug?: string })[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 50);
  const offset = (page - 1) * limit;

  try {
    let searchProductIds: string[] | undefined;
    if (filters.search?.trim()) {
      const { data: matchedProducts } = await supabaseAdmin
        .from('products')
        .select('id')
        .ilike('name', `%${filters.search.trim()}%`);
      searchProductIds = (matchedProducts ?? []).map(p => p.id);
    }

    let query = supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null);

    if (filters.search?.trim()) {
      if (searchProductIds && searchProductIds.length > 0) {
        query = query.in('product_id', searchProductIds);
      } else {
        return { reviews: [], total: 0, page, totalPages: 0 };
      }
    }

    if (filters.rating && filters.rating > 0) {
      query = query.eq('rating', filters.rating);
    }

    switch (filters.sort) {
      case 'oldest': query = query.order('created_at', { ascending: true }); break;
      case 'highest': query = query.order('rating', { ascending: false }).order('created_at', { ascending: false }); break;
      case 'lowest': query = query.order('rating', { ascending: true }).order('created_at', { ascending: false }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

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
      return {
        reviews: reviews.map(r => ({
          ...r,
          productName: r.productId ? productMap[r.productId]?.name : undefined,
          productSlug: r.productId ? productMap[r.productId]?.slug : undefined,
          productImage: r.productId ? imageMap[r.productId] : undefined,
        })),
        total: count ?? 0,
        page,
        totalPages: Math.ceil((count ?? 0) / limit)
      };
    }

    return {
      reviews: reviews as any,
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit)
    };
  } catch (error) {
    console.error('[reviews] getGlobalReviews failed:', error);
    return { reviews: [], total: 0, page, totalPages: 0 };
  }
};
