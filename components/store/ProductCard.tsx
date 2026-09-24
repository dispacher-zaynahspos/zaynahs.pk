'use client';

import React, { useState, useEffect } from 'react';
import { getSharedAspectClass, getSharedTitleClampClass } from '@/lib/utils/styles';
import { Product, StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { animateFlyTo } from '@/lib/utils/flyAnimation';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

import { ProductCardSwatches, VariationGroup } from './product-card/ProductCardSwatches';
import { ProductCardShowcases } from './product-card/ProductCardShowcases';
import { StandardProductCard } from './product-card/StandardProductCard';
import { ProductCardStyleInjector } from './product-card/ProductCardStyles';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';

// Lazy load QuickViewModal to reduce initial JS bundle
const QuickViewModal = dynamic(() => import('./QuickViewModal'), {
  ssr: false,
  loading: () => null,
});

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  settings?: StoreSettings | null;
  priority?: boolean;
}

export default function ProductCard({ product, currencySymbol = 'Rs.', settings, priority = false }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const fallbackPlaceholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";
  const primaryImage = getPresetImageUrl(product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || fallbackPlaceholder, 'card');

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [userSelectedColor, setUserSelectedColor] = useState(false);

  // Settings properties
  const showStars = settings?.card_show_stars !== false;
  const showWishlist = settings?.card_show_wishlist !== false;
  const showQuickview = settings?.card_show_quickview !== false;
  const showQuickcart = settings?.card_show_quickcart !== false;
  const cardAlignment = settings?.card_alignment || 'left';
  const elementsOrder = settings?.card_elements_order || ['title', 'rating', 'price', 'swatches'];

  const handleCardClick = () => {
    saveScrollPosition(product.id);
  };

  useEffect(() => {
    const checkWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.includes(product.id));
    };
    checkWishlist();
    window.addEventListener('wishlist-updated', checkWishlist);
    return () => {
      window.removeEventListener('wishlist-updated', checkWishlist);
    };
  }, [product.id]);

  const activeVariants = product.variants.filter(v => v.active);
  const defaultIndex = (settings?.defaultVariantIndex || 1) - 1;
  const defaultVar = activeVariants[defaultIndex] || activeVariants[0];

  // Selected variation attribute states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedCustom, setSelectedCustom] = useState<string | null>(null);

  // Sync state when defaultVar changes
  useEffect(() => {
    setSelectedColor(defaultVar?.color || null);
    setSelectedSize(defaultVar?.size || null);
    setSelectedMaterial(defaultVar?.material || null);
    setSelectedCustom(defaultVar?.customValue || null);
    setUserSelectedColor(false);
  }, [defaultVar]);

  // Find currently matched variant based on selections
  const currentVariant = activeVariants.find(v => {
    const colorMatch = !selectedColor || v.color === selectedColor;
    const sizeMatch = !selectedSize || v.size === selectedSize;
    const materialMatch = !selectedMaterial || v.material === selectedMaterial;
    const customMatch = !selectedCustom || v.customValue === selectedCustom;
    return colorMatch && sizeMatch && materialMatch && customMatch;
  }) || activeVariants.find(v => {
    const colorMatch = !selectedColor || v.color === selectedColor;
    const sizeMatch = !selectedSize || v.size === selectedSize;
    return colorMatch && sizeMatch;
  }) || activeVariants.find(v => v.color === selectedColor) || activeVariants.find(v => v.size === selectedSize) || defaultVar;

  const currentImage = (userSelectedColor && currentVariant && currentVariant.imageUrl) ? getPresetImageUrl(currentVariant.imageUrl, 'card') : primaryImage;
  const currentPrice = (currentVariant && currentVariant.price) ? currentVariant.price : product.price;
  const currentComparePrice = (currentVariant && currentVariant.comparePrice) ? currentVariant.comparePrice : product.comparePrice;

  // Active price range logic
  const activePrices = activeVariants.map(v => v.price).filter((p): p is number => typeof p === 'number' && p > 0);
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : product.price;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : product.price;
  const hasPriceRange = minPrice !== maxPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasVariants) {
      setQuickViewOpen(true);
      return;
    }
    addItem(product, undefined, [], 1);
    toast.success(`${product.name} added to cart!`);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const targetId = isMobile ? 'header-cart-icon-mobile' : 'header-cart-icon-desktop';
    animateFlyTo(e.currentTarget as HTMLElement, targetId, primaryImage);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    if (isInWishlist) {
      newWishlist = wishlist.filter((id: string) => id !== product.id);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, product.id];
      toast.success('Added to wishlist');

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const targetId = isMobile ? 'mobile-bottom-wishlist-icon' : 'header-wishlist-icon-desktop';
      animateFlyTo(e.currentTarget as HTMLElement, targetId, primaryImage);
    }
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const displayDescription = (settings?.card_show_description !== false)
    ? (product.shortDescription || '')
    : '';

  const swatchShape = settings?.swatchShape ?? 'circle';
  const archiveSwatchSize = settings?.archiveSwatchSize ?? settings?.swatchSize ?? 'md';

  const shapeMap: Record<string, string> = {
    circle: 'rounded-full',
    square: 'rounded-sm'
  };
  const shapeClass = shapeMap[swatchShape] || shapeMap.circle;

  // Group unique attribute values for display
  const colorVariants = product.variants
    .filter(v => v.color && v.active)
    .reduce<typeof product.variants>((acc, v) => {
      const exists = acc.find(e => e.color === v.color);
      if (!exists) acc.push(v);
      return acc;
    }, []);

  const sizeVariants = product.variants
    .filter(v => v.size && v.active)
    .reduce<typeof product.variants>((acc, v) => {
      const exists = acc.find(e => e.size === v.size);
      if (!exists) acc.push(v);
      return acc;
    }, []);

  const materialVariants = product.variants
    .filter(v => v.material && v.active)
    .reduce<typeof product.variants>((acc, v) => {
      const exists = acc.find(e => e.material === v.material);
      if (!exists) acc.push(v);
      return acc;
    }, []);

  const customVariants = product.variants
    .filter(v => v.customValue && v.active)
    .reduce<typeof product.variants>((acc, v) => {
      const exists = acc.find(e => e.customValue === v.customValue);
      if (!exists) acc.push(v);
      return acc;
    }, []);

  const availableGroups: VariationGroup[] = [];
  if (colorVariants.length > 0 && settings?.card_show_type_color !== false) {
    availableGroups.push({ type: 'color', name: 'Color', variants: colorVariants });
  }
  if (sizeVariants.length > 0 && settings?.card_show_type_size !== false) {
    availableGroups.push({ type: 'size', name: 'Size', variants: sizeVariants });
  }
  if (materialVariants.length > 0 && settings?.card_show_type_material !== false) {
    availableGroups.push({ type: 'material', name: 'Material', variants: materialVariants });
  }
  if (customVariants.length > 0 && settings?.card_show_type_custom !== false) {
    const customName = product.variants?.find(v => v.customOption)?.customOption || 'Custom';
    availableGroups.push({ type: 'custom', name: customName, variants: customVariants });
  }

  const variationOrder = product.variationOrder || ['color', 'size', 'material', 'custom'];
  availableGroups.sort((a, b) => {
    const aIdx = variationOrder.indexOf(a.type);
    const bIdx = variationOrder.indexOf(b.type);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const handleSelectAttribute = (attr: 'color' | 'size' | 'material' | 'customValue', val: string) => {
    const newSelections = {
      color: attr === 'color' ? val : selectedColor,
      size: attr === 'size' ? val : selectedSize,
      material: attr === 'material' ? val : selectedMaterial,
      customValue: attr === 'customValue' ? val : selectedCustom,
    };

    let matched = activeVariants.find(v => {
      return (!newSelections.color || v.color === newSelections.color) &&
        (!newSelections.size || v.size === newSelections.size) &&
        (!newSelections.material || v.material === newSelections.material) &&
        (!newSelections.customValue || v.customValue === newSelections.customValue);
    });

    if (!matched && attr !== 'color' && newSelections.color) {
      matched = activeVariants.find(v => v.color === newSelections.color && v[attr] === val);
    }

    if (!matched) {
      matched = activeVariants.find(v => v[attr] === val);
    }

    setUserSelectedColor(true);

    if (matched) {
      setSelectedColor(matched.color || null);
      setSelectedSize(matched.size || null);
      setSelectedMaterial(matched.material || null);
      setSelectedCustom(matched.customValue || null);
    } else {
      if (attr === 'color') setSelectedColor(val);
      if (attr === 'size') setSelectedSize(val);
      if (attr === 'material') setSelectedMaterial(val);
      if (attr === 'customValue') setSelectedCustom(val);
    }
  };

  const aspectClass = getSharedAspectClass(settings?.imageAspectRatio);
  const titleClampClass = getSharedTitleClampClass(settings?.titleLineLimit);

  const hasSecondImage = product.images?.length > 1;
  const secondImage = hasSecondImage ? getPresetImageUrl(product.images?.[1]?.url || product.images?.[0]?.url, 'card') : null;

  const alignClass = cardAlignment === 'center' ? 'items-center text-center' :
    cardAlignment === 'right' ? 'items-end text-right' :
      'items-start text-left';

  const swatchAlign = (settings?.archiveSwatchAlign || 'left') === 'center' ? 'justify-center' :
    (settings?.archiveSwatchAlign || 'left') === 'right' ? 'justify-end' :
      'justify-start';

  const activeImage = hoveredImage || currentImage;
  const activeStyle = settings?.card_style || 'style1';

  const finalRenderedGroups = (
    <ProductCardSwatches
      availableGroups={availableGroups}
      currentVariant={currentVariant}
      settings={settings}
      swatchAlign={swatchAlign}
      shapeClass={shapeClass}
      archiveSwatchSize={archiveSwatchSize}
      onHoverImage={setHoveredImage}
      onSelectAttribute={handleSelectAttribute}
    />
  );

  const isShowcase = activeStyle.startsWith('showcase_');

  return (
    <>
      <ProductCardStyleInjector />
      {isShowcase ? (
        <ProductCardShowcases
          activeStyle={activeStyle}
          product={product}
          settings={settings}
          currencySymbol={currencySymbol}
          activeImage={activeImage}
          secondImage={secondImage}
          hoveredImage={hoveredImage}
          isInWishlist={isInWishlist}
          showWishlist={showWishlist}
          showQuickview={showQuickview}
          showQuickcart={showQuickcart}
          showStars={showStars}
          aspectClass={aspectClass}
          titleClampClass={titleClampClass}
          alignClass={alignClass}
          elementsOrder={elementsOrder}
          currentPrice={currentPrice}
          currentComparePrice={currentComparePrice}
          hasPriceRange={hasPriceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          displayDescription={displayDescription}
          finalRenderedGroups={finalRenderedGroups}
          onToggleWishlist={handleToggleWishlist}
          onOpenQuickView={handleOpenQuickView}
          onAddToCart={handleAddToCart}
          onCardClick={handleCardClick}
        />
      ) : (
        <StandardProductCard
          product={product}
          currencySymbol={currencySymbol}
          settings={settings}
          activeImage={activeImage}
          secondImage={secondImage}
          hoveredImage={hoveredImage}
          isInWishlist={isInWishlist}
          showWishlist={showWishlist}
          showQuickview={showQuickview}
          showQuickcart={showQuickcart}
          showStars={showStars}
          aspectClass={aspectClass}
          titleClampClass={titleClampClass}
          alignClass={alignClass}
          elementsOrder={elementsOrder}
          currentPrice={currentPrice}
          currentComparePrice={currentComparePrice}
          hasPriceRange={hasPriceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          displayDescription={displayDescription}
          swatchAlign={swatchAlign}
          finalRenderedGroups={finalRenderedGroups}
          onToggleWishlist={handleToggleWishlist}
          onOpenQuickView={handleOpenQuickView}
          onAddToCart={handleAddToCart}
          onCardClick={handleCardClick}
        />
      )}

      {/* Quick View Modal */}
      {quickViewOpen && settings && (
        <QuickViewModal
          product={product}
          settings={settings}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
