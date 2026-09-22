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
  variant = 'floating',
}) => {
  if (variant === 'action-btn') {
    return (
      <div className="card-actions" onClick={(e) => e.preventDefault()}>
        {showWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            className="action-btn animate-fade-in"
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}
        {showQuickview && (
          <button
            type="button"
            onClick={onOpenQuickView}
            className="action-btn animate-fade-in"
            title="Quick View"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {showQuickcart && (
          <button
            type="button"
            onClick={onAddToCart}
            className="action-btn animate-fade-in"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="aic">
      {showWishlist && (
        <button
          type="button"
          onClick={onToggleWishlist}
          className="ai"
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      )}

      {showQuickview && (
        <button
          type="button"
          onClick={onOpenQuickView}
          className="ai"
          title="Quick View"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}

      {showQuickcart && (
        <button
          type="button"
          onClick={onAddToCart}
          className="ai"
          title={hasVariants ? "Choose Options" : "Add to Cart"}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
