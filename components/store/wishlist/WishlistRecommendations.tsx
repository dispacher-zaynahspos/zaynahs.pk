'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Product, StoreSettings } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import { getProductsByIdsClient } from '@/lib/services/products-client';
import { Sparkles, Eye, TrendingUp, Tag, Heart } from '@/components/common/Icons';

interface WishlistRecommendationsProps {
  settings: StoreSettings;
  wishlistProductIds: string[];
  fallbackProducts?: Product[];
}

export default function WishlistRecommendations({
  settings,
  wishlistProductIds,
  fallbackProducts = [],
}: WishlistRecommendationsProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartProductIds, setCartProductIds] = useState<Set<string>>(new Set());

  // Settings
  const enabled = settings.wishlist_recommendations_enabled !== false;
  const source = settings.wishlist_recommendations_source || 'recently_viewed';
  const limit = Math.max(2, Math.min(12, settings.wishlist_recommendations_limit || 4));
  const sectionTitle =
    settings.wishlist_recommendations_title ||
    (source === 'recently_viewed' ? 'Recently Viewed' : 'Recommended for You');

  // Load current cart items from localStorage to prevent recommending items buyer already has in cart
  const refreshCartIds = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const cartRaw = localStorage.getItem('cart') || '[]';
      const parsed = JSON.parse(cartRaw);
      const ids = new Set<string>();
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item?.product?.id) ids.add(item.product.id);
          if (item?.id) ids.add(item.id);
          if (item?.product_id) ids.add(item.product_id);
        }
      }
      setCartProductIds(ids);
    } catch {
      setCartProductIds(new Set());
    }
  }, []);

  useEffect(() => {
    refreshCartIds();
    window.addEventListener('cart-updated', refreshCartIds);
    window.addEventListener('storage', refreshCartIds);
    return () => {
      window.removeEventListener('cart-updated', refreshCartIds);
      window.removeEventListener('storage', refreshCartIds);
    };
  }, [refreshCartIds]);

  // Combined exclusion set: Wishlist items + Cart items
  const excludedIds = useMemo(() => {
    const set = new Set<string>(cartProductIds);
    for (const id of wishlistProductIds) {
      if (id) set.add(id);
    }
    return set;
  }, [cartProductIds, wishlistProductIds]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let active = true;

    const loadRecommendations = async () => {
      try {
        if (source === 'recently_viewed') {
          // Read from localStorage / sessionStorage
          let recentStr = '[]';
          try {
            recentStr = localStorage.getItem('recently-viewed') || '[]';
          } catch {
            recentStr = sessionStorage.getItem('recently-viewed') || '[]';
          }

          let recentIds: string[] = [];
          try {
            const parsed = JSON.parse(recentStr);
            if (Array.isArray(parsed)) recentIds = parsed.filter(Boolean);
          } catch {
            recentIds = [];
          }

          // Exclude any ID currently in wishlist or cart
          const availableRecentIds = recentIds.filter(id => !excludedIds.has(id)).slice(0, limit);

          let loadedRecent: Product[] = [];
          if (availableRecentIds.length > 0) {
            // First match against fallbackProducts in memory if already present
            const matchedFromMemory = availableRecentIds
              .map(id => fallbackProducts.find(p => p.id === id))
              .filter((p): p is Product => !!p);

            const missingIds = availableRecentIds.filter(id => !matchedFromMemory.some(p => p.id === id));
            if (missingIds.length > 0) {
              const fetched = await getProductsByIdsClient(missingIds);
              loadedRecent = [...matchedFromMemory, ...(fetched || [])];
            } else {
              loadedRecent = matchedFromMemory;
            }
          }

          // Auto-fallback: if buyer viewed fewer products than limit (or all viewed items are in wishlist/cart),
          // seamlessly backfill from fallbackProducts (excluding wishlist items, cart items and already loaded items)
          if (loadedRecent.length < limit && fallbackProducts.length > 0) {
            const existingIds = new Set(loadedRecent.map(p => p.id));
            const backfill = fallbackProducts
              .filter(p => !excludedIds.has(p.id) && !existingIds.has(p.id))
              .slice(0, limit - loadedRecent.length);
            loadedRecent = [...loadedRecent, ...backfill];
          }

          if (active) {
            setRecommendedProducts(loadedRecent);
            setLoading(false);
          }
        } else if (source === 'best_selling') {
          // Best selling curated items from catalog
          const filtered = fallbackProducts
            .filter(p => !excludedIds.has(p.id))
            .slice(0, limit);

          if (active) {
            setRecommendedProducts(filtered);
            setLoading(false);
          }
        } else if (source === 'new_arrivals') {
          // New arrivals sorted by created_at or id descending
          const sorted = [...fallbackProducts]
            .filter(p => !excludedIds.has(p.id))
            .sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            })
            .slice(0, limit);

          if (active) {
            setRecommendedProducts(sorted);
            setLoading(false);
          }
        } else {
          // Featured products or catalog curation
          const featured = fallbackProducts
            .filter(p => !excludedIds.has(p.id) && (p.is_featured || p.tags?.includes('featured')))
            .slice(0, limit);

          const finalProducts = featured.length >= limit
            ? featured
            : [
                ...featured,
                ...fallbackProducts.filter(p => !excludedIds.has(p.id) && !featured.some(f => f.id === p.id))
              ].slice(0, limit);

          if (active) {
            setRecommendedProducts(finalProducts);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load wishlist recommendations:', err);
        if (active) {
          const safeFallback = fallbackProducts
            .filter(p => !excludedIds.has(p.id))
            .slice(0, limit);
          setRecommendedProducts(safeFallback);
          setLoading(false);
        }
      }
    };

    loadRecommendations();

    const handleStorageUpdate = () => {
      if (source === 'recently_viewed') {
        loadRecommendations();
      }
    };

    window.addEventListener('recently-viewed-updated', handleStorageUpdate);
    return () => {
      active = false;
      window.removeEventListener('recently-viewed-updated', handleStorageUpdate);
    };
  }, [enabled, source, limit, excludedIds, fallbackProducts]);

  // If disabled or no products available at all, return null
  if (!enabled || (!loading && recommendedProducts.length === 0)) {
    return null;
  }

  // Choose icon based on source
  const getSourceIcon = () => {
    switch (source) {
      case 'recently_viewed':
        return <Eye className="h-4 w-4 text-rose-500" />;
      case 'best_selling':
        return <TrendingUp className="h-4 w-4 text-rose-500" />;
      case 'new_arrivals':
        return <Tag className="h-4 w-4 text-rose-500" />;
      case 'featured':
      default:
        return <Sparkles className="h-4 w-4 text-rose-500" />;
    }
  };

  const getSourceSubtitle = () => {
    switch (source) {
      case 'recently_viewed':
        return 'Items you recently browsed or might love to explore';
      case 'best_selling':
        return 'Top trending favorites loved by other shoppers';
      case 'new_arrivals':
        return 'Fresh new styles just added to the collection';
      case 'featured':
      default:
        return 'Curated selections handpicked for your taste';
    }
  };

  return (
    <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-100 dark:border-gray-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            {getSourceIcon()}
            <span>{sectionTitle}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {getSourceSubtitle()}
          </p>
        </div>
      </div>

      {/* Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {recommendedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySymbol={settings.currency_symbol || 'Rs.'}
              settings={settings}
              priority={index < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
