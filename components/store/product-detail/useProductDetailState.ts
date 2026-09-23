'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, StoreSettings, ProductVariant, ProductModifier } from '@/lib/types';
import { getProductsByIdsClient } from '@/lib/services/products-client';
import { trackEvent } from '@/lib/trackEvent';

interface UseProductDetailStateProps {
  product: Product;
  settings: StoreSettings;
}

export function useProductDetailState({ product, settings }: UseProductDetailStateProps) {
  const images = useMemo(() => {
    return product.images.length > 0
      ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
      : [{ id: 'dummy', productId: product.id, url: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E", alt: product.name, sortOrder: 0, isPrimary: true, createdAt: '' }];
  }, [product.images, product.id, product.name]);

  const [activeImage, setActiveImage] = useState(images.find(img => img.isPrimary)?.url || images?.[0]?.url);
  const [activeImageIndex, setActiveImageIndex] = useState(
    Math.max(0, images.findIndex(img => img.url === (images.find(i => i.isPrimary)?.url || images?.[0]?.url)))
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedModifiers, setSelectedModifiers] = useState<ProductModifier[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'description' | 'faq' | 'returns'>('description');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleVariantChange = useCallback((v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.imageUrl) {
      const idx = images.findIndex(img => img.url === v.imageUrl);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      } else {
        setActiveImage(v.imageUrl);
      }
    }
  }, [images]);

  const [mounted, setMounted] = useState(false);
  const [viewerCount, setViewerCount] = useState(23);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });

  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);
  const [bundleVariantSelections, setBundleVariantSelections] = useState<Record<string, string>>({});

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    setMounted(true);
    const min = settings.minViews ?? 10;
    const max = settings.maxViews ?? 50;
    setViewerCount(Math.floor(Math.random() * (max - min + 1)) + min);
    setProductUrl(window.location.href);
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product.id));

    if (!product.hasVariants || !product.variants || product.variants.filter(v => v.active).length === 0) {
      trackEvent('ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: settings.currency || 'PKR'
      });
    }

    try {
      let storage: Storage;
      try {
        localStorage.setItem('_rv_test', '1');
        localStorage.removeItem('_rv_test');
        storage = localStorage;
      } catch {
        storage = sessionStorage;
      }
      const recentStr = storage.getItem('recently-viewed') || '[]';
      const recent: string[] = JSON.parse(recentStr);
      const filtered = recent.filter(id => id !== product.id);
      const updated = [product.id, ...filtered].slice(0, 10);
      storage.setItem('recently-viewed', JSON.stringify(updated));
      try { sessionStorage.setItem('recently-viewed', JSON.stringify(updated)); } catch { /* ignore */ }
      window.dispatchEvent(new Event('recently-viewed-updated'));
    } catch (err) {
      console.error('Failed to update recently viewed:', err);
    }

    const loadBundleData = async () => {
      try {
        if (product.frequentlyBoughtTogetherIds && product.frequentlyBoughtTogetherIds.length > 0) {
          const filtered = await getProductsByIdsClient(product.frequentlyBoughtTogetherIds);
          setBundleProducts(filtered);
          setSelectedBundleIds(filtered.map((p: Product) => p.id));
          const defaultSelections: Record<string, string> = {};
          filtered.forEach((p: Product) => {
            if (p.hasVariants && p.variants.length > 0) {
              const firstActive = p.variants.filter(v => v.active)[0];
              if (firstActive) defaultSelections[p.id] = firstActive.id;
            }
          });
          setBundleVariantSelections(defaultSelections);
        }
      } catch (err) {
        console.error('Failed to load bundle products:', err);
      }
    };
    loadBundleData();

    const updateTimeLeft = () => {
      let isFlashSaleActive = false;
      let targetDateStr: string | undefined = undefined;
      let isIncoming = false;
      let isInfinite = false;

      const now = new Date().getTime();
      const prodStart = product.flashSaleStartDate ? new Date(product.flashSaleStartDate).getTime() : 0;
      const prodEnd = product.flashSaleEndDate ? new Date(product.flashSaleEndDate).getTime() : 0;

      if (product.flashSaleEnabled) {
        if (!product.flashSaleStartDate && !product.flashSaleEndDate) {
          isFlashSaleActive = true;
          isInfinite = true;
        } else if (prodEnd > now || (prodStart > now && prodEnd === 0)) {
          isFlashSaleActive = true;
          if (prodStart > now) {
            isIncoming = true;
            targetDateStr = product.flashSaleStartDate!;
          } else {
            targetDateStr = product.flashSaleEndDate;
          }
        }
      } else if (settings.flash_sale_enabled) {
        const globalStart = settings.flash_sale_start_date ? new Date(settings.flash_sale_start_date).getTime() : 0;
        const globalEnd = settings.flash_sale_end_date ? new Date(settings.flash_sale_end_date).getTime() : 0;

        if (!settings.flash_sale_start_date && !settings.flash_sale_end_date) {
          isFlashSaleActive = true;
          isInfinite = true;
        } else if (globalEnd > now || (globalStart > now && globalEnd === 0)) {
          isFlashSaleActive = true;
          if (globalStart > now) {
            isIncoming = true;
            targetDateStr = settings.flash_sale_start_date || undefined;
          } else {
            targetDateStr = settings.flash_sale_end_date || undefined;
          }
        }
      }

      if (!isFlashSaleActive) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });
        return;
      }

      if (isInfinite) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false, isIncoming: false, isInfinite: true });
        return;
      }

      if (!targetDateStr) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        targetDateStr = midnight.toISOString();
      }

      const targetTime = new Date(targetDateStr).getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, expired: false, isIncoming, isInfinite: false });
    };

    updateTimeLeft();
    const countdownTimer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(countdownTimer);
  }, [product.id, settings.minViews, settings.maxViews, product.categoryId, product.flashSaleEnabled, product.flashSaleStartDate, product.flashSaleEndDate, product.frequentlyBoughtTogetherIds, settings.flash_sale_enabled, settings.flash_sale_start_date, settings.flash_sale_end_date]);

  useEffect(() => {
    if (!mounted || !selectedVariant) return;
    trackEvent('ViewContent', {
      content_ids: [selectedVariant.id],
      content_name: `${product.name} - ${[selectedVariant.color, selectedVariant.size].filter(Boolean).join(', ')}`,
      content_type: 'product',
      value: selectedVariant.price || product.price,
      currency: settings.currency || 'PKR'
    });
  }, [selectedVariant, mounted, product.name, product.price, settings.currency]);

  return {
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
    isWishlisted,
    setIsWishlisted,
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
  };
}
