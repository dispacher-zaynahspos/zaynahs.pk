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
  variant?: 'floating' | 'action-btn' | 'slide-drawer' | 'direct-button' | 'corner-fab' | 'split-bar' | 'center-pill';
  className?: string;
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
  className = '',
}) => {
  // ── 1. SLIDE-DRAWER (Zara / Haute Editorial) ──────────────────────────────────
  if (variant === 'slide-drawer') {
    return (
      <>
        {/* Wishlist subtle minimal icon on top-right */}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto absolute right-2.5 top-2.5 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 text-gray-800 dark:text-gray-100 shadow-sm border border-black/5 dark:border-white/10 hover:scale-110 transition-transform cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Bottom Full-Width Slide-Up Drawer */}
        {showQuickcart && (
          <div className="absolute inset-x-0 bottom-0 z-[25] overflow-hidden pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="slide-drawer-btn pointer-events-auto w-full py-2.5 px-3 bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 text-[10.5px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all duration-300"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{hasVariants ? 'Choose Options' : '+ Quick Add'}</span>
            </button>
          </div>
        )}
      </>
    );
  }

  // ── 2. CORNER-FAB (Nike / Streetwear Athletic) ────────────────────────────────
  if (variant === 'corner-fab') {
    return (
      <>
        {/* Wishlist on top-right */}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto absolute right-2 top-2 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-black/5 dark:border-white/10 cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Quick View small button top-left/below wishlist */}
        {showQuickview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto absolute right-2 top-10 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-black/5 dark:border-white/10 cursor-pointer"
            aria-label="Quick View"
            title="Quick View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Floating Action Button (FAB) at bottom-right corner */}
        {showQuickcart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="corner-fab-btn pointer-events-auto absolute right-2.5 -bottom-4 z-[25] h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[var(--color-primary,#111)] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
            aria-label={hasVariants ? "Choose Options" : "Add to Cart"}
            title={hasVariants ? "Choose Options" : "Add to Cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </>
    );
  }

  // ── 3. DIRECT-BUTTON (Daraz / Deal Rush Standalone Action) ─────────────────────
  if (variant === 'direct-button') {
    return (
      <div className={`direct-btn-wrap w-full z-[25] ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="direct-cart-btn pointer-events-auto w-full py-1.5 sm:py-2 px-3 rounded-xl bg-[var(--color-primary,#e94560)] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{hasVariants ? 'Choose Options' : 'Add to Cart'}</span>
        </button>
      </div>
    );
  }

  // ── 4. SPLIT-BAR (Amazon Dual Action Footer) ──────────────────────────────────
  if (variant === 'split-bar') {
    return (
      <div className={`split-action-bar grid grid-cols-2 gap-1.5 w-full z-[25] mt-2.5 ${className}`}>
        {showQuickview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="split-btn-qv pointer-events-auto py-1.5 px-2 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
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
            className="split-btn-cart pointer-events-auto py-1.5 px-2 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 bg-[var(--color-primary,#e94560)] text-white hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>{hasVariants ? 'Options' : 'Add'}</span>
          </button>
        )}
      </div>
    );
  }

  // ── 5. CENTER-PILL (Sephora Chic) ─────────────────────────────────────────────
  if (variant === 'center-pill') {
    return (
      <>
        {/* Wishlist top-right */}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto absolute right-2.5 top-2.5 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Center Pill on Hover */}
        {showQuickview && (
          <div className="center-pill-wrap absolute inset-0 flex items-center justify-center pointer-events-none z-[25]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenQuickView(e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="center-pill-btn pointer-events-auto py-1.5 px-3.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-white/95 dark:bg-[#16162a]/95 text-gray-900 dark:text-white shadow-lg border border-gray-200/80 dark:border-gray-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 is-in-focus:opacity-100 is-in-focus:translate-y-0 active-card:opacity-100 active-card:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </>
    );
  }

  // ── 6. DEFAULT FLOATING STACK (action-btn / floating) ─────────────────────────
  const containerClass = variant === 'action-btn' ? 'card-actions' : 'aic';
  const btnClass = variant === 'action-btn' ? 'action-btn' : 'ai';

  return (
    <div
      className={`${containerClass} ${className} transition-all duration-200 ease-out`}
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
