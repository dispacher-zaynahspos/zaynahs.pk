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
  const handleTouch = (e: React.TouchEvent, handler: (e: any) => void) => {
    e.preventDefault();
    e.stopPropagation();
    handler(e);
  };

  const containerClass = variant === 'action-btn' ? 'card-actions' : 'aic';
  const btnClass = variant === 'action-btn' ? 'action-btn' : 'ai';

  return (
    <div
      className={containerClass}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {showWishlist && (
        <button
          type="button"
          onClick={onToggleWishlist}
          onTouchEnd={(e) => handleTouch(e, onToggleWishlist)}
          className={btnClass}
          aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      )}
      {showQuickview && (
        <button
          type="button"
          onClick={onOpenQuickView}
          onTouchEnd={(e) => handleTouch(e, onOpenQuickView)}
          className={btnClass}
          aria-label="Quick View"
          title="Quick View"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      {showQuickcart && (
        <button
          type="button"
          onClick={onAddToCart}
          onTouchEnd={(e) => handleTouch(e, onAddToCart)}
          className={btnClass}
          aria-label={hasVariants ? "Choose Options" : "Add to Cart"}
          title={hasVariants ? "Choose Options" : "Add to Cart"}
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
