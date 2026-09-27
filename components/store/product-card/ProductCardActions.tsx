'use client';

import React from 'react';
import { ShoppingCart, Heart, Eye } from '@/components/common/Icons';

interface ProductCardActionsProps {
  showWishlist: boolean;
  showQuickview: boolean;
  showQuickcart: boolean;
  isInWishlist: boolean;
  hasVariants: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onOpenQuickView: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  variant?: 'floating' | 'action-btn';
}

export const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  showWishlist,
  showQuickview,
  showQuickcart,
  isInWishlist,
  hasVariants,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
  variant = 'action-btn',
}) => {
  const containerClass = variant === 'action-btn' ? 'card-actions' : 'aic';
  const btnClass = variant === 'action-btn' ? 'action-btn' : 'ai';

  // Visibility is driven ENTIRELY by customCss (RULE UI-CARD-INTERACTION):
  //  • touch devices → always visible
  //  • hover-capable pointer devices → reveal on real :hover
  // Never toggle visibility from JS/scroll state here.
  return (
    <div
      className={`${containerClass} transition-all duration-200 ease-out`}
      style={{ pointerEvents: 'none' }}
    >
      {showWishlist && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className={`${btnClass} pointer-events-auto`}
          aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      )}
      {showQuickview && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenQuickView(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className={`${btnClass} pointer-events-auto`}
          aria-label="Quick View"
          title="Quick View"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      {showQuickcart && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className={`${btnClass} pointer-events-auto`}
          aria-label={hasVariants ? "Choose Options" : "Add to Cart"}
          title={hasVariants ? "Choose Options" : "Add to Cart"}
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
