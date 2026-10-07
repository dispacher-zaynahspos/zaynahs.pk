'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, Badge, SizeGuide } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { getSizeGuides } from '@/lib/services/sizeGuides';
import { getBadges } from '@/lib/services/badges';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

import { useProductImageDrag } from './useProductImageDrag';
import { useProductVariantsState } from './useProductVariantsState';
import { useProductFormAiCopywrite } from './useProductFormAiCopywrite';
import { useProductFormSubmit } from './useProductFormSubmit';

interface UseProductFormStateProps {
  categories: Category[];
  initialProduct?: Product | null;
  aiEnabled?: boolean;
}

export function useProductFormState({ categories, initialProduct, aiEnabled }: UseProductFormStateProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const isEdit = !!initialProduct?.id;

  const flattenedCategories = React.useMemo(() => {
    return categories.map(c => ({ ...c, _level: 0 }));
  }, [categories]);

  // 1. Core States
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '0');
  const [comparePrice, setComparePrice] = useState(initialProduct?.compare_price?.toString() || '');
  const [cost, setCost] = useState(initialProduct?.cost?.toString() || '0');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || '');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (initialProduct?.product_categories && initialProduct.product_categories.length > 0)
      ? initialProduct.product_categories.map(pc => pc.category_id)
      : (initialProduct?.category_id ? [initialProduct.category_id] : [])
  );
  const [inventoryThreshold, setInventoryThreshold] = useState(initialProduct?.inventory_threshold?.toString() || '0');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '0');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || '');
  const [tagInput, setTagInput] = useState(initialProduct?.tags?.join(', ') || '');
  const [enableSwatches, setEnableSwatches] = useState<boolean>(initialProduct?.enable_swatches ?? true);
  const [showSwatchesOnArchive, setShowSwatchesOnArchive] = useState<boolean>(initialProduct?.show_swatches_on_archive ?? true);
  const [activeImageSelector, setActiveImageSelector] = useState<{ axisIdx: number; valIdx: number } | null>(null);
  const [hasVariants, setHasVariantsState] = useState(initialProduct?.has_variants ?? false);
  const [isService, setIsService] = useState(initialProduct?.is_service ?? false);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [rating, setRating] = useState(initialProduct?.rating?.toString() || '5.0');
  const [reviewsCount, setReviewsCount] = useState(initialProduct?.reviews_count?.toString() || '0');
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [customBadgeId, setCustomBadgeId] = useState(initialProduct?.custom_badge_id || '');
  const [badgeEnabled, setBadgeEnabled] = useState(initialProduct?.badge_enabled ?? true);
  const [sizeGuideId, setSizeGuideId] = useState(initialProduct?.size_guide_id || '');
  const [sizeGuidesList, setSizeGuidesList] = useState<SizeGuide[]>([]);

  const [flashSaleEnabled, setFlashSaleEnabled] = useState(initialProduct?.flash_sale_enabled ?? false);
  const [flashSaleStartDate, setFlashSaleStartDate] = useState(initialProduct?.flash_sale_start_date ? new Date(initialProduct.flash_sale_start_date).toISOString().slice(0, 16) : '');
  const [flashSaleEndDate, setFlashSaleEndDate] = useState(initialProduct?.flash_sale_end_date ? new Date(initialProduct.flash_sale_end_date).toISOString().slice(0, 16) : '');
  const [flashSaleDiscountType, setFlashSaleDiscountType] = useState<'percentage' | 'fixed'>(initialProduct?.flash_sale_discount_type ?? 'fixed');
  const [flashSaleDiscountValue, setFlashSaleDiscountValue] = useState(initialProduct?.flash_sale_discount_value ?? 0);
  const [frequentlyBoughtTogetherIds, setFrequentlyBoughtTogetherIds] = useState(initialProduct?.frequently_bought_together_ids || []);
  const [productList, setProductList] = useState<Product[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [visibleProductCount, setVisibleProductCount] = useState(20);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(20);

  useEffect(() => {
    setVisibleProductCount(20);
  }, [productSearchQuery]);

  useEffect(() => {
    setVisibleCategoryCount(20);
  }, [categorySearchQuery]);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [aiConfigured] = useState<boolean>(aiEnabled ?? false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sub-hooks
  const imageDrag = useProductImageDrag({ initialProduct });
  const variantsHook = useProductVariantsState({
    initialProduct,
    price,
    comparePrice,
    sku,
    stock,
    inventoryThreshold,
  });

  const setHasVariants = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setHasVariantsState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      variantsHook.setVariantsSectionCollapsed(!next);
      return next;
    });
  }, [variantsHook.setVariantsSectionCollapsed]);

  const { isAiGenerating, handleAICopywrite } = useProductFormAiCopywrite({
    name,
    setSlug,
    description,
    setDescription,
    price,
    categoryId,
    categories,
    initialProduct,
    setShortDescription,
    setTagInput,
    editorRef,
  });

  const submitHook = useProductFormSubmit();

  useEffect(() => {
    async function loadBadgesAndSizeGuides() {
      try {
        const supabaseClient = createClient();
        const [b, sg, prods] = await Promise.all([
          getBadges(),
          getSizeGuides(),
          supabaseClient.from('products').select('id, name, price, sku, product_images(url, is_primary, sort_order)').is('deleted_at', null).order('name')
        ]);
        setAllBadges(b);
        setSizeGuidesList(sg);
        const allProducts: any[] = prods.data || [];
        const seen = new Set<string>();
        const unique = allProducts.filter((p: any) => {
          if (p.id === initialProduct?.id) return false;
          const key = p.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setProductList(unique as any);
      } catch (err) {
        console.error('Failed to load badges, size guides or products:', err);
      }
    }
    loadBadgesAndSizeGuides();
  }, []);

  useEffect(() => {
    if (!isHtmlMode && editorRef.current) {
      editorRef.current.innerHTML = description || '';
    }
  }, [isHtmlMode]);

  const execCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    return submitHook.handleSubmit(e, {
      name,
      slug,
      sku,
      price,
      comparePrice,
      cost,
      selectedCategoryIds,
      inventoryThreshold,
      stock,
      hasVariants,
      isService,
      isFeatured,
      isActive,
      enableSwatches,
      showSwatchesOnArchive,
      customBadgeId,
      badgeEnabled,
      sizeGuideId,
      frequentlyBoughtTogetherIds,
      flashSaleEnabled,
      flashSaleStartDate,
      flashSaleEndDate,
      flashSaleDiscountType,
      flashSaleDiscountValue,
      tagInput,
      description,
      shortDescription,
      rating,
      reviewsCount,
      isEdit,
      initialProduct,
      images: imageDrag.images,
      variants: variantsHook.variants,
      modifiers: variantsHook.modifiers,
      variantAxes: variantsHook.variantAxes,
    });
  };

  const handleShowAiNotice = () => {
    toast.info('AI is not enabled. Go to Admin → Settings → AI Copywriter to enable it.', { duration: 5000 });
  };

  return {
    router,
    confirm,
    isEdit,
    flattenedCategories,
    name,
    setName,
    slug,
    setSlug,
    sku,
    setSku,
    price,
    setPrice: (val: string) => {
      setPrice(val);
      variantsHook.handlePriceChange(val);
    },
    comparePrice,
    setComparePrice: (val: string) => {
      setComparePrice(val);
      variantsHook.handleComparePriceChange(val);
    },
    cost,
    setCost,
    categoryId,
    setCategoryId,
    selectedCategoryIds,
    setSelectedCategoryIds,
    inventoryThreshold,
    setInventoryThreshold,
    stock,
    setStock,
    description,
    setDescription,
    shortDescription,
    setShortDescription,
    tagInput,
    setTagInput,
    enableSwatches,
    setEnableSwatches,
    showSwatchesOnArchive,
    setShowSwatchesOnArchive,
    activeImageSelector,
    setActiveImageSelector,
    hasVariants,
    setHasVariants,
    isService,
    setIsService,
    isFeatured,
    setIsFeatured,
    isActive,
    setIsActive,
    rating,
    setRating,
    reviewsCount,
    setReviewsCount,
    allBadges,
    customBadgeId,
    setCustomBadgeId,
    badgeEnabled,
    setBadgeEnabled,
    sizeGuideId,
    setSizeGuideId,
    sizeGuidesList,
    flashSaleEnabled,
    setFlashSaleEnabled,
    flashSaleStartDate,
    setFlashSaleStartDate,
    flashSaleEndDate,
    setFlashSaleEndDate,
    flashSaleDiscountType,
    setFlashSaleDiscountType,
    flashSaleDiscountValue,
    setFlashSaleDiscountValue,
    frequentlyBoughtTogetherIds,
    setFrequentlyBoughtTogetherIds,
    productList,
    categorySearchQuery,
    setCategorySearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    visibleProductCount,
    setVisibleProductCount,
    visibleCategoryCount,
    setVisibleCategoryCount,
    isAiGenerating,
    isSubmitting: submitHook.isSubmitting,
    previewImageUrl,
    setPreviewImageUrl,
    isMediaModalOpen,
    setIsMediaModalOpen,
    aiConfigured,
    handleAICopywrite,
    isHtmlMode,
    setIsHtmlMode,
    editorRef,
    execCommand,
    images: imageDrag.images,
    setImages: imageDrag.setImages,
    activeImageId: imageDrag.activeImageId,
    sensors: imageDrag.sensors,
    handleDragStartImages: imageDrag.handleDragStartImages,
    handleDragCancelImages: imageDrag.handleDragCancelImages,
    handleDragEndImages: imageDrag.handleDragEndImages,
    handleRemoveImage: imageDrag.handleRemoveImage,
    variants: variantsHook.variants,
    setVariants: variantsHook.setVariants,
    selectedVariantIndices: variantsHook.selectedVariantIndices,
    setSelectedVariantIndices: variantsHook.setSelectedVariantIndices,
    variantSearchTerm: variantsHook.variantSearchTerm,
    setVariantSearchTerm: variantsHook.setVariantSearchTerm,
    filteredVariants: variantsHook.filteredVariants,
    handlePriceChange: variantsHook.handlePriceChange,
    handleComparePriceChange: variantsHook.handleComparePriceChange,
    variantAxes: variantsHook.variantAxes,
    setVariantAxes: variantsHook.setVariantAxes,
    axisInputs: variantsHook.axisInputs,
    setAxisInputs: variantsHook.setAxisInputs,
    presets: variantsHook.presets,
    collapsedAxes: variantsHook.collapsedAxes,
    setCollapsedAxes: variantsHook.setCollapsedAxes,
    variantsSectionCollapsed: variantsHook.variantsSectionCollapsed,
    setVariantsSectionCollapsed: variantsHook.setVariantsSectionCollapsed,
    axisOrderChanged: variantsHook.axisOrderChanged,
    setAxisOrderChanged: variantsHook.setAxisOrderChanged,
    handleMoveAxisUp: variantsHook.handleMoveAxisUp,
    handleMoveAxisDown: variantsHook.handleMoveAxisDown,
    handleReorderAxisValues: variantsHook.handleReorderAxisValues,
    modifiers: variantsHook.modifiers,
    modName: variantsHook.modName,
    setModName: variantsHook.setModName,
    modPrice: variantsHook.modPrice,
    setModPrice: variantsHook.setModPrice,
    handleAddModifier: variantsHook.handleAddModifier,
    handleRemoveModifier: variantsHook.handleRemoveModifier,
    handleGenerateVariants: variantsHook.handleGenerateVariants,
    handleUpdateVariant: variantsHook.handleUpdateVariant,
    handleRemoveVariant: variantsHook.handleRemoveVariant,
    handleBulkDelete: variantsHook.handleBulkDelete,
    handleBulkUpdatePrice: variantsHook.handleBulkUpdatePrice,
    handleBulkUpdateComparePrice: variantsHook.handleBulkUpdateComparePrice,
    handleBulkUpdateStock: variantsHook.handleBulkUpdateStock,
    handleBulkUpdateSku: variantsHook.handleBulkUpdateSku,
    handleBulkUpdateThreshold: variantsHook.handleBulkUpdateThreshold,
    handleBulkUpdateActive: variantsHook.handleBulkUpdateActive,
    handleSubmit: handleFormSubmit,
    handleShowAiNotice,
  };
}
