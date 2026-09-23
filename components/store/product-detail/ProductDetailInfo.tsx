'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Heart,
  Share2,
  Eye,
  HelpCircle,
  Ruler,
  WhatsAppIcon
} from '@/components/common/Icons';
import { StoreSettings, Product, ProductVariant, ProductModifier } from '@/lib/types';
import VariantSelector from '../VariantSelector';
import { formatPrice } from '@/lib/utils/whatsapp';
import { ProductDetailPriceTimer } from './info/ProductDetailPriceTimer';
import { ProductDetailTrustBadges } from './info/ProductDetailTrustBadges';

interface ProductDetailInfoProps {
  product: Product;
  settings: StoreSettings;
  selectedVariant?: ProductVariant;
  onVariantChange: (v: ProductVariant) => void;
  selectedModifiers: ProductModifier[];
  onModifierToggle: (m: ProductModifier) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  stockAvailable: number;
  unitPrice: number;
  minPrice: number;
  maxPrice: number;
  hasPriceRange: boolean;
  displayRating: number;
  displayCount: number;
  viewerCount: number;
  timeLeft: { hours: number; minutes: number; seconds: number; expired: boolean; isIncoming: boolean; isInfinite: boolean };
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onOpenShareModal: () => void;
  onOpenSizeGuide: () => void;
  whatsappUrl: string;
}

export default function ProductDetailInfo({
  product,
  settings,
  selectedVariant,
  onVariantChange,
  selectedModifiers,
  onModifierToggle,
  quantity,
  setQuantity,
  stockAvailable,
  unitPrice,
  minPrice,
  maxPrice,
  hasPriceRange,
  displayRating,
  displayCount,
  viewerCount,
  timeLeft,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenShareModal,
  onOpenSizeGuide,
  whatsappUrl,
}: ProductDetailInfoProps) {
  const [mounted, setMounted] = useState(false);
  const sizeGuide = product.sizeGuide;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="space-y-1">
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {product.category.name}
            </span>
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>

          {/* Ratings and Reviews count */}
          {mounted && (displayCount > 0 || displayRating > 0) && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => {
                  const starVal = i + 1;
                  if (displayRating >= starVal) {
                    return <span key={i} className="text-base">★</span>;
                  } else if (displayRating >= starVal - 0.5) {
                    return <span key={i} className="text-base">★</span>;
                  } else {
                    return <span key={i} className="text-gray-200 dark:text-gray-700 text-base">★</span>;
                  }
                })}
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {displayCount} reviews
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Flash Sale Countdown Timer */}
        <ProductDetailPriceTimer
          settings={settings}
          selectedVariant={selectedVariant}
          unitPrice={unitPrice}
          minPrice={minPrice}
          maxPrice={maxPrice}
          hasPriceRange={hasPriceRange}
          productComparePrice={product.comparePrice}
          mounted={mounted}
          timeLeft={timeLeft}
        />

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Live views trust element */}
        {mounted && settings.enableFakeViews && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800/80 rounded-xl px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 w-fit">
            <Eye className="h-4 w-4 text-[#e94560]" />
            <span>
              <strong className="font-extrabold text-[#e94560]">{viewerCount}</strong> people are viewing this right now
            </span>
          </div>
        )}

        {/* Stock status */}
        {!product.isService && settings.showStock && (
          <div className="text-xs font-semibold">
            {stockAvailable > 0 ? (
              <span className="text-[#10b981]">In Stock ({stockAvailable} left)</span>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>
        )}

        {/* Stock Urgency Banner */}
        {!product.isService && settings.stock_urgency_enabled !== false && stockAvailable > 0 && stockAvailable <= 5 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#e94560] bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg font-bold w-fit animate-pulse border border-rose-100 dark:border-rose-900/30">
            <span>🔥 Hurry! Only {stockAvailable} left in stock!</span>
          </div>
        )}

        {/* Variant Selector */}
        {product.hasVariants && product.variants.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Options</span>
              {settings.size_guide_enabled !== false && sizeGuide && (
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-xs font-bold text-[#e94560] hover:underline cursor-pointer flex items-center gap-1"
                >
                  📏 Size Guide
                </button>
              )}
            </div>
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onChangeSelectedVariant={onVariantChange}
              enableSwatches={product.enableSwatches}
              settings={settings}
              variationOrder={product.variationOrder}
            />
          </div>
        )}

        {/* Modifiers List */}
        {product.modifiers && product.modifiers.filter(m => m.active).length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Add-ons / Customizations</span>
            <div className="space-y-2">
              {product.modifiers.filter(m => m.active).map(mod => {
                const isSelected = selectedModifiers.some(m => m.id === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => onModifierToggle(mod)}
                    className={`flex w-full items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer ${isSelected
                      ? 'border-[#1a1a2e] bg-[#1a1a2e]/5 dark:border-[#e94560] dark:bg-[#e94560]/10'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-[#16162a]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${isSelected ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white dark:bg-[#e94560] dark:border-[#e94560]' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent'}`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{mod.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      +{formatPrice(mod.price, settings.currencySymbol)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ask a Question & Share Link Row */}
        {mounted && (
          <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-800 pt-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--color-primary,#C2185B)] transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span>Ask a question</span>
            </a>

            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 hover:text-[var(--color-primary,#C2185B)] transition-colors cursor-pointer"
            >
              <Share2 className="h-4.5 w-4.5" />
              <span>Share</span>
            </button>

            {settings.size_guide_enabled !== false && sizeGuide && (
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="flex items-center gap-1.5 hover:text-[var(--color-primary,#C2185B)] transition-colors cursor-pointer"
              >
                <Ruler className="h-4.5 w-4.5" />
                <span>Size Guide</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quantity</span>
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#16162a]">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 text-sm font-bold text-gray-900 dark:text-white w-12 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer disabled:opacity-50"
              disabled={quantity >= stockAvailable}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart & Wishlist buttons */}
        <div className="flex gap-3">
          <button
            onClick={onAddToCart}
            disabled={stockAvailable <= 0}
            style={{
              backgroundColor: stockAvailable <= 0 ? undefined : 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
              color: 'var(--btn-primary-text, #ffffff)',
              borderRadius: 'var(--border-radius-btn, 12px)'
            }}
            className="flex-1 flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-bold transition-all duration-200 shadow-md cursor-pointer hover:brightness-110"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{stockAvailable <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>

          {mounted && (
            <button
              onClick={onToggleWishlist}
              style={{ borderRadius: 'var(--border-radius-btn, 12px)' }}
              className={`p-3.5 border transition-all duration-200 active:scale-95 cursor-pointer ${isWishlisted
                ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900/35 dark:bg-red-500/10'
                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Instant WhatsApp Order CTA - Smart, compact & beautifully aligned */}
        {settings.enable_product_quick_whatsapp !== false && settings.whatsappNumber && (
          <div className="flex justify-center pt-0.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-50/70 hover:bg-[#25D366] text-[#0f6b32] hover:text-white dark:bg-emerald-950/30 dark:border-emerald-700/40 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-95 group cursor-pointer"
            >
              <WhatsAppIcon className="h-4 w-4 fill-[#25D366] group-hover:fill-white transition-colors" />
              <span>Order via WhatsApp</span>
            </a>
          </div>
        )}
      </div>

      {/* Trust Badges Panel & Safe Checkout */}
      <ProductDetailTrustBadges settings={settings} mounted={mounted} />
    </div>
  );
}
