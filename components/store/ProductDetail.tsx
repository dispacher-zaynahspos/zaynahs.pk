'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from '@/components/common/Icons';
import { StoreSettings, Product, ProductVariant, ProductModifier } from '@/lib/types';
import { getProductsClient } from '@/lib/services/products-client';
import { useCartStore } from '@/store/cartStore';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/trackEvent';
import { flyToCart } from '@/lib/utils/flyAnimation';
import { useWishlist } from '@/components/store/product-card/hooks/useWishlist';
import { isFeatureEnabled } from '@/lib/features/premium';
import {
  ProductDetailGallery,
  ProductDetailInfo,
  ProductDetailBundle,
  ProductDetailTabs,
  ProductDetailModals,
  ProductDetailStickyBar
} from './product-detail';

import { useProductDetailState } from './product-detail/useProductDetailState';

interface ProductDetailProps {
  product: Product;
  settings: StoreSettings;
  averageRating?: { average: number; count: number };
  socialProofCount?: number;
}

export default function ProductDetail({ product, settings, averageRating, socialProofCount = 0 }: ProductDetailProps) {
  const addItem = useCartStore(state => state.addItem);

  const {
    images,
    activeImage,
    setActiveImage,
    activeImageIndex,
    setActiveImageIndex,
    selectedVariant,
    setSelectedVariant,
    selectedModifiers,
    setSelectedModifiers,
    quantity,
    setQuantity,
    activeDetailTab,
    setActiveDetailTab,
    isDescExpanded,
    setIsDescExpanded,
    handleVariantChange,
    mounted,
    viewerCount,
    isShareOpen,
    setIsShareOpen,
    copied,
    setCopied,
    productUrl,
    timeLeft,
    bundleProducts,
    selectedBundleIds,
    setSelectedBundleIds,
    bundleVariantSelections,
    setBundleVariantSelections,
    showSizeGuide,
    setShowSizeGuide,
  } = useProductDetailState({ product, settings });

  const handleAddBundleToCart = (e?: React.MouseEvent) => {
    const addedNames: string[] = [];

    bundleProducts.forEach(bp => {
      if (selectedBundleIds.includes(bp.id)) {
        let chosenVariant: ProductVariant | undefined = undefined;
        if (bp.has_variants && bp.variants.length > 0) {
          const selectedVarId = bundleVariantSelections[bp.id];
          chosenVariant = bp.variants?.find(v => v.id === selectedVarId && v.active)
            ?? bp.variants.filter(v => v.active)[0];
        }
        addItem(bp, chosenVariant, [], 1);
        addedNames.push(bp.name);
      }
    });

    if (addedNames.length === 0) {
      toast.error('Please select at least one bundle item to add.');
      return;
    }

    const totalBundleValue = bundleProducts
      .filter(p => selectedBundleIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    const bundleIds = bundleProducts.filter(p => selectedBundleIds.includes(p.id)).map(p => p.id);
    trackEvent('AddToCart', {
      content_ids: bundleIds,
      content_name: `${product.name} Bundle`,
      content_type: 'product',
      value: totalBundleValue,
      currency: settings.currency || 'PKR'
    });

    toast.success(`${addedNames.length} bundle item${addedNames.length > 1 ? 's' : ''} added to cart!`);
    const sourceEl = e && 'currentTarget' in e && e.currentTarget instanceof HTMLElement ? e.currentTarget : null;
    flyToCart(sourceEl, images?.[0]?.url, product.id);
  };

  const activeVariants = product.variants.filter(v => v.active);
  const activePrices = activeVariants.map(v => v.price).filter((p): p is number => typeof p === 'number' && p > 0);
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : product.price;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : product.price;
  const hasPriceRange = minPrice !== maxPrice;

  const basePrice = selectedVariant?.price ?? product.price;
  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const unitPrice = basePrice + modifiersTotal;

  const stockAvailable = product.is_service
    ? 999
    : (selectedVariant ? selectedVariant.stock : product.stock);

  const displayRating = (averageRating && averageRating.count > 0) ? averageRating.average : (product.rating ?? 5);
  const displayCount = (averageRating ? averageRating.count : (product.reviews_count ?? 0)) + socialProofCount;

  const handleModifierToggle = (modifier: ProductModifier) => {
    setSelectedModifiers(prev =>
      prev.some(m => m.id === modifier.id)
        ? prev.filter(m => m.id !== modifier.id)
        : [...prev, modifier]
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (product.has_variants && product.variants.filter(v => v.active).length > 0 && !selectedVariant) {
      toast.error('Please select a variant first');
      return;
    }
    if (quantity > stockAvailable) {
      toast.error(`Only ${stockAvailable} items left in stock`);
      return;
    }
    addItem(product, selectedVariant, selectedModifiers, quantity);

    const activeId = selectedVariant?.id || product.id;
    trackEvent('AddToCart', {
      content_ids: [activeId],
      content_name: product.name,
      content_type: 'product',
      value: unitPrice * quantity,
      currency: settings.currency || 'PKR'
    });

    toast.success(`${product.name} added to cart!`);

    const imageUrl = selectedVariant?.image_url || product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url;
    flyToCart(e.currentTarget as HTMLElement, imageUrl, product.id);
  };

  // Wishlist via the shared single-source hook (variant-aware fly image).
  const wishlistFlyImage = selectedVariant?.image_url
    || product.images?.find(img => img.is_primary)?.url
    || product.images?.[0]?.url
    || '';
  const { isInWishlist: isWishlisted, toggleWishlist } = useWishlist(product.id, wishlistFlyImage);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/${cleanWhatsAppPhone(settings.whatsapp_number)}?text=${encodeURIComponent(`Hello, I have a question about ${product.name}: ${productUrl}`)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/shop';
          }
        }}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start bg-white dark:bg-[#16162a] p-5 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-white transition-colors">
        {/* Gallery */}
        <ProductDetailGallery
          product={product}
          settings={settings}
          images={images}
          activeImage={activeImage}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          selectedVariant={selectedVariant}
          stockAvailable={stockAvailable}
        />

        {/* Product Info & Controls */}
        <ProductDetailInfo
          product={product}
          settings={settings}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
          selectedModifiers={selectedModifiers}
          onModifierToggle={handleModifierToggle}
          quantity={quantity}
          setQuantity={setQuantity}
          stockAvailable={stockAvailable}
          unitPrice={unitPrice}
          minPrice={minPrice}
          maxPrice={maxPrice}
          hasPriceRange={hasPriceRange}
          displayRating={displayRating}
          displayCount={displayCount}
          viewerCount={viewerCount}
          timeLeft={timeLeft}
          isWishlisted={isWishlisted}
          onToggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onOpenShareModal={() => setIsShareOpen(true)}
          onOpenSizeGuide={() => setShowSizeGuide(true)}
          whatsappUrl={whatsappUrl}
        />
      </div>

      {/* Frequently Bought Together Bundle Widget */}
      {mounted && isFeatureEnabled(settings, 'frequently_bought_together') && (
        <ProductDetailBundle
          product={product}
          settings={settings}
          images={images}
          unitPrice={unitPrice}
          bundleProducts={bundleProducts}
          selectedBundleIds={selectedBundleIds}
          setSelectedBundleIds={setSelectedBundleIds}
          bundleVariantSelections={bundleVariantSelections}
          setBundleVariantSelections={setBundleVariantSelections}
          onAddBundleToCart={handleAddBundleToCart}
        />
      )}

      {/* Detail Tabs (Description, FAQ, Return policy) */}
      <ProductDetailTabs
        product={product}
        settings={settings}
        activeDetailTab={activeDetailTab}
        setActiveDetailTab={setActiveDetailTab}
        isDescExpanded={isDescExpanded}
        setIsDescExpanded={setIsDescExpanded}
      />

      {/* Share and Size Guide Modals */}
      <ProductDetailModals
        product={product}
        settings={settings}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
        showSizeGuide={showSizeGuide}
        setShowSizeGuide={setShowSizeGuide}
        productUrl={productUrl}
        copied={copied}
        onCopyLink={handleCopyLink}
      />

      {/* Mobile Sticky Quick Buy Action Bar */}
      <ProductDetailStickyBar
        product={product}
        selectedVariant={selectedVariant}
        stockAvailable={stockAvailable}
        unitPrice={unitPrice}
        currencySymbol={settings.currency_symbol}
        onAddToCart={handleAddToCart}
        whatsappUrl={whatsappUrl}
        activeImage={activeImage}
        enableQuickWhatsapp={settings.enable_product_quick_whatsapp !== false && !!settings.whatsapp_number}
      />
    </div>
  );
}
