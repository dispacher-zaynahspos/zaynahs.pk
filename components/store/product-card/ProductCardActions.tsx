'use client';

import React from 'react';
import { ShoppingCart, Heart, Eye } from '@/components/common/Icons';

export type CardIconStyle = 'minimal' | 'pill' | 'luxe' | 'brutalist' | 'glass';

// ── 5 DISTINCT ICON GLYPHS ───────────────────────────────────────────────────
export const CardWishlistIcon: React.FC<{
  isInWishlist: boolean;
  iconStyle?: CardIconStyle;
  className?: string;
}> = ({ isInWishlist, iconStyle = 'pill', className = 'h-3.5 w-3.5' }) => {
  if (iconStyle === 'minimal') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill={isInWishlist ? '#ef4444' : 'none'} stroke={isInWishlist ? '#ef4444' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (iconStyle === 'luxe') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill={isInWishlist ? '#d97706' : 'none'} stroke={isInWishlist ? '#d97706' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 5.6L20 8.4l-4 4.2 1 5.8-5-3-5 3 1-5.8-4-4.2 5.6-.8L12 2z" />
      </svg>
    );
  }
  if (iconStyle === 'brutalist') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill={isInWishlist ? '#ef4444' : 'none'} stroke={isInWishlist ? '#ef4444' : 'currentColor'} strokeWidth="2.2" strokeLinecap="square">
        <polygon points="12,21 3,12 3,5 9,5 12,8 15,5 21,5 21,12" />
      </svg>
    );
  }
  if (iconStyle === 'glass') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill={isInWishlist ? '#ef4444' : 'none'} stroke={isInWishlist ? '#ef4444' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return <Heart className={`${className} ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />;
};

export const CardQuickviewIcon: React.FC<{
  iconStyle?: CardIconStyle;
  className?: string;
}> = ({ iconStyle = 'pill', className = 'h-3.5 w-3.5' }) => {
  if (iconStyle === 'minimal') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (iconStyle === 'luxe') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    );
  }
  if (iconStyle === 'brutalist') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
        <rect x="3" y="3" width="18" height="18" rx="0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (iconStyle === 'glass') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    );
  }
  return <Eye className={className} />;
};

export const CardCartIcon: React.FC<{
  iconStyle?: CardIconStyle;
  className?: string;
}> = ({ iconStyle = 'pill', className = 'h-3.5 w-3.5' }) => {
  if (iconStyle === 'minimal') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (iconStyle === 'luxe') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="13" rx="1.5" />
        <path d="M9 8V5a3 3 0 0 1 6 0v3" />
      </svg>
    );
  }
  if (iconStyle === 'brutalist') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
        <polygon points="1,1 5,1 7,13 19,13 21,5 6,5" />
        <rect x="7" y="17" width="3" height="3" />
        <rect x="17" y="17" width="3" height="3" />
      </svg>
    );
  }
  if (iconStyle === 'glass') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M1 1h4l2.6 13h11.4l2-8H6" />
      </svg>
    );
  }
  return <ShoppingCart className={className} />;
};

export const CardCompareIcon: React.FC<{
  iconStyle?: CardIconStyle;
  className?: string;
}> = ({ className = 'h-3.5 w-3.5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
};

interface ProductCardActionsProps {
  showWishlist: boolean;
  showQuickview: boolean;
  showQuickcart: boolean;
  isInWishlist: boolean;
  hasVariants: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onOpenQuickView: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  iconStyle?: CardIconStyle;
  variant?:
    | 'floating'
    | 'action-btn'
    | 'slide-drawer'
    | 'direct-button'
    | 'corner-fab'
    | 'split-bar'
    | 'center-pill'
    | 'marketplace-bottom'
    | 'pill-right'
    | 'polaroid-actions'
    | 'text-links'
    | 'hang-tag-action'
    | 'story-plus';
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
  iconStyle = 'pill',
  variant = 'action-btn',
  className = '',
}) => {
  const presetClass = `icon-preset-${iconStyle}`;

  // ── 1. SLIDE-DRAWER (Zara / Haute Editorial) ──────────────────────────────────
  if (variant === 'slide-drawer') {
    return (
      <div className={`slide-drawer-actions-container ${presetClass}`}>
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
            className="action-btn pointer-events-auto !absolute !right-2.5 !top-2.5 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 text-gray-800 dark:text-gray-100 shadow-sm border border-black/5 dark:border-white/10 hover:scale-110 transition-transform cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
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
              className="slide-drawer-btn pointer-events-auto w-full py-2 px-2.5 bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all duration-300 whitespace-nowrap truncate"
            >
              <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hasVariants ? 'Choose Options' : '+ Quick Add'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 2. CORNER-FAB (Nike / Streetwear Athletic) ────────────────────────────────
  if (variant === 'corner-fab') {
    return (
      <div className={`corner-fab-actions-container ${presetClass}`}>
        {/* Wishlist on top-right — strictly pinned to right-2 top-2 */}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto !absolute !right-2 !top-2 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-black/5 dark:border-white/10 cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Quick View small button top-right below wishlist */}
        {showQuickview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="action-btn pointer-events-auto !absolute !right-2 !top-10 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-black/5 dark:border-white/10 cursor-pointer"
            aria-label="Quick View"
            title="Quick View"
          >
            <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
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
            className="corner-fab-btn pointer-events-auto !absolute !right-2.5 !-bottom-4 sm:!-bottom-[18px] z-[30] h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[var(--color-primary,#f85606)] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
            aria-label={hasVariants ? "Choose Options" : "Add to Cart"}
            title={hasVariants ? "Choose Options" : "Add to Cart"}
          >
            <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>
    );
  }

  // ── 3. DIRECT-BUTTON (Daraz / Deal Rush Standalone Action) ─────────────────────
  if (variant === 'direct-button') {
    return (
      <div className={`direct-btn-wrap w-full z-[25] mt-auto ${presetClass} ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="direct-cart-btn pointer-events-auto w-full py-1.5 px-2.5 rounded-xl bg-[var(--color-primary,#e94560)] text-white text-[10.5px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap truncate"
        >
          <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{hasVariants ? 'Choose Options' : 'Add to Cart'}</span>
        </button>
      </div>
    );
  }

  // ── 4. SPLIT-BAR (Amazon Dual Action Footer) ──────────────────────────────────
  if (variant === 'split-bar') {
    return (
      <div className={`split-action-bar grid grid-cols-2 gap-1.5 w-full z-[25] mt-auto ${presetClass} ${className}`}>
        {showQuickview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="split-btn-qv pointer-events-auto py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-semibold flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap truncate"
          >
            <CardQuickviewIcon iconStyle={iconStyle} className="h-3 w-3 shrink-0" />
            <span className="truncate">View</span>
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
            className="split-btn-cart pointer-events-auto py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-bold flex items-center justify-center gap-1 bg-[var(--color-primary,#e94560)] text-white hover:opacity-95 shadow-xs transition-opacity cursor-pointer whitespace-nowrap truncate"
          >
            <CardCartIcon iconStyle={iconStyle} className="h-3 w-3 shrink-0" />
            <span className="truncate">{hasVariants ? 'Options' : 'Add'}</span>
          </button>
        )}
      </div>
    );
  }

  // ── 5. CENTER-PILL (Sephora Chic) ─────────────────────────────────────────────
  if (variant === 'center-pill') {
    return (
      <div className={`center-pill-actions-container ${presetClass}`}>
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
            className="action-btn pointer-events-auto !absolute !right-2.5 !top-2.5 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer"
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
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
              className="center-pill-btn pointer-events-auto py-1.5 px-3 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 bg-white/95 dark:bg-[#16162a]/95 text-gray-900 dark:text-white shadow-lg border border-gray-200/80 dark:border-gray-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 is-in-focus:opacity-100 is-in-focus:translate-y-0 active-card:opacity-100 active-card:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap truncate"
            >
              <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Quick View</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 6. MARKETPLACE-BOTTOM (Card 2: Amazon / Daraz Rating-First) ───────────────
  if (variant === 'marketplace-bottom') {
    return (
      <div className={`marketplace-bottom-wrap flex items-center gap-2 w-full z-[25] mt-auto ${presetClass} ${className}`}>
        {showQuickcart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#ffa41c] hover:bg-[#fa8900] active:scale-[0.98] text-gray-950 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer pointer-events-auto whitespace-nowrap truncate"
          >
            <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{hasVariants ? 'Options' : 'Add to Cart'}</span>
          </button>
        )}
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-8 w-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 cursor-pointer pointer-events-auto shrink-0 shadow-xs"
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // ── 7. PILL-RIGHT (Card 4: Flash Deal Rush Buy Now Pill) ──────────────────────
  if (variant === 'pill-right') {
    return (
      <div className={`pill-right-wrap z-[25] shrink-0 ${presetClass} ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="py-1 px-2.5 rounded-full bg-[#f85606] hover:bg-[#e04e05] active:scale-95 text-white text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider shadow-sm transition-transform cursor-pointer pointer-events-auto whitespace-nowrap"
        >
          {hasVariants ? 'Options' : 'Buy Now'}
        </button>
      </div>
    );
  }

  // ── 8. POLAROID-ACTIONS (Card 6: Polaroid Frame Add Button + Eye) ─────────────
  if (variant === 'polaroid-actions') {
    return (
      <div className={`polaroid-actions-wrap flex items-center gap-1.5 w-full z-[25] mt-auto ${presetClass} ${className}`}>
        {showQuickcart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 py-1 px-2 rounded-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer pointer-events-auto text-center whitespace-nowrap truncate"
          >
            <span className="truncate">{hasVariants ? 'Options' : '+ Add'}</span>
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
            className="h-6 w-6 rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#16162a] flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 cursor-pointer pointer-events-auto shrink-0"
            title="Quick View"
          >
            <CardQuickviewIcon iconStyle={iconStyle} className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // ── 9. TEXT-LINKS (Card 7: Round Charm 3 Links Divided by Lines) ─────────────
  if (variant === 'text-links') {
    return (
      <div className={`text-links-wrap flex items-center justify-center gap-2 py-1 text-[9.5px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider z-[25] mt-auto ${presetClass} ${className}`}>
        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`hover:text-amber-600 transition-colors cursor-pointer pointer-events-auto whitespace-nowrap ${isInWishlist ? 'text-red-500 font-bold' : ''}`}
          >
            {isInWishlist ? 'Saved' : 'Save'}
          </button>
        )}
        <span className="text-gray-300 dark:text-gray-700 select-none">|</span>
        {showQuickview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="hover:text-amber-600 transition-colors cursor-pointer pointer-events-auto whitespace-nowrap"
          >
            View
          </button>
        )}
        <span className="text-gray-300 dark:text-gray-700 select-none">|</span>
        {showQuickcart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="hover:text-amber-600 transition-colors cursor-pointer pointer-events-auto whitespace-nowrap"
          >
            {hasVariants ? 'Options' : '+ Bag'}
          </button>
        )}
      </div>
    );
  }

  // ── 10. HANG-TAG-ACTION (Card 9: Underlined Quick Add Text Link) ──────────────
  if (variant === 'hang-tag-action') {
    return (
      <div className={`hang-tag-action-wrap z-[25] mt-auto ${presetClass} ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[11px] font-bold tracking-wide uppercase text-gray-800 dark:text-gray-200 underline underline-offset-4 hover:text-[#c0603a] transition-colors cursor-pointer pointer-events-auto whitespace-nowrap"
        >
          {hasVariants ? 'Choose Size →' : 'Quick Add +'}
        </button>
      </div>
    );
  }

  // ── 11. STORY-PLUS (Card 10: Round Plus Button Expanding on Hover) ────────────
  if (variant === 'story-plus') {
    return (
      <div className={`story-plus-wrap z-[25] shrink-0 ${presetClass} ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(e);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="story-plus-btn h-7 px-2 rounded-full bg-white/90 text-gray-950 text-xs font-extrabold flex items-center justify-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto whitespace-nowrap"
          title={hasVariants ? "Choose Options" : "Add to Cart"}
        >
          <span className="text-sm font-black leading-none">+</span>
          <span className="hidden group-hover:inline text-[9.5px] uppercase tracking-wider">
            {hasVariants ? 'Options' : 'Add'}
          </span>
        </button>
      </div>
    );
  }

  // ── 12. DEFAULT FLOATING STACK (action-btn / floating) ────────────────────────
  const containerClass = variant === 'action-btn' ? 'card-actions' : 'aic';
  const btnClass = variant === 'action-btn' ? 'action-btn' : 'ai';

  return (
    <div
      className={`${containerClass} ${presetClass} ${className} transition-all duration-200 ease-out`}
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
          <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
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
          <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
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
          <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
