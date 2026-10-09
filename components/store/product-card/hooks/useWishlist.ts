'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { flyToWishlist } from '@/lib/utils/flyAnimation';

/**
 * SINGLE source for storefront wishlist toggling (localStorage-backed).
 *
 * Any card that needs a wishlist button uses this hook — one behavior, everywhere.
 * Employs universal fly / drop animation that adapts to mobile bottom nav or desktop header.
 *
 * @param productId product being toggled
 * @param flyImage  image used for the fly/drop animation on add
 */
export function useWishlist(productId: string, flyImage?: string) {
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

  const toggleWishlist = (
    e?: React.MouseEvent | HTMLElement,
    explicitSource?: HTMLElement | null
  ) => {
    if (e && 'preventDefault' in e && typeof e.preventDefault === 'function') {
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

      const sourceEl =
        explicitSource ||
        (e && 'currentTarget' in e && e.currentTarget instanceof HTMLElement
          ? e.currentTarget
          : e instanceof HTMLElement
          ? e
          : null);

      flyToWishlist(sourceEl, flyImage, productId);
    }

    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsInWishlist(!isInWishlist);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return { isInWishlist, toggleWishlist };
}
