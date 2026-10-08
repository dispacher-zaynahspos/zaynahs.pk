'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { animateFlyTo } from '@/lib/utils/flyAnimation';

/**
 * SINGLE source for storefront wishlist toggling (localStorage-backed).
 *
 * Previously the identical add/remove + fly-animation + `wishlist-updated`
 * broadcast logic was copy-pasted in `ProductCard.tsx` and
 * `shop-page/ShopProductListCard.tsx` (and the wishlist page). Any card that
 * needs a wishlist button uses this hook — one behavior, everywhere.
 *
 * @param productId product being toggled
 * @param flyImage  image used for the fly-to-header animation on add
 */
export function useWishlist(productId: string, flyImage: string) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsInWishlist(wishlist.includes(productId));
      } catch {
        setIsInWishlist(false);
      }
    };
    check();
    window.addEventListener('wishlist-updated', check);
    return () => window.removeEventListener('wishlist-updated', check);
  }, [productId]);

  const toggleWishlist = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist: string[];
    if (isInWishlist) {
      newWishlist = wishlist.filter((id: string) => id !== productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, productId];
      toast.success('Added to wishlist');
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const targetId = isMobile ? 'mobile-bottom-wishlist-icon' : 'header-wishlist-icon-desktop';
      if (e?.currentTarget) {
        animateFlyTo(e.currentTarget as HTMLElement, targetId, flyImage);
      }
    }
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsInWishlist(!isInWishlist);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return { isInWishlist, toggleWishlist };
}
