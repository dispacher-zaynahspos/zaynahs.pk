'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { createProductSafe, updateProductSafe } from '@/lib/services/products/actions';
import { toast } from 'sonner';
import { buildVariantCombinations } from './useProductVariantsState';

interface ProductSubmitPayloadParams {
  name: string;
  slug: string;
  sku: string;
  price: string;
  comparePrice: string;
  cost: string;
  selectedCategoryIds: string[];
  inventoryThreshold: string;
  stock: string;
  hasVariants: boolean;
  isService: boolean;
  isFeatured: boolean;
  isActive: boolean;
  enableSwatches: boolean;
  showSwatchesOnArchive: boolean;
  customBadgeId: string;
  badgeEnabled: boolean;
  sizeGuideId: string;
  frequentlyBoughtTogetherIds: string[];
  flashSaleEnabled: boolean;
  flashSaleStartDate: string;
  flashSaleEndDate: string;
  flashSaleDiscountType: 'percentage' | 'fixed';
  flashSaleDiscountValue: number;
  tagInput: string;
  description: string;
  shortDescription: string;
  rating: string;
  reviewsCount: string;
  isEdit: boolean;
  initialProduct?: Product | null;
  images: any[];
  variants: any[];
  modifiers: any[];
  variantAxes: any[];
}

export function useProductFormSubmit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    params: ProductSubmitPayloadParams
  ) => {
    e.preventDefault();

    if (!params.name.trim()) return toast.error('Product Name is required.');
    if (!params.slug.trim()) return toast.error('Product Slug is required.');
    if (params.selectedCategoryIds.length === 0)
      return toast.error('Please select at least one Category.');

    setIsSubmitting(true);

    try {
      const parsedTags = params.tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      let finalVariants = [...(params.variants || [])];

      if (params.hasVariants) {
        const validAxes = (params.variantAxes || []).filter((a: any) => a.values && a.values.length > 0);

        // Auto-generate combinations if merchant added attribute values but didn't press Generate All Combinations
        if (finalVariants.length === 0 && validAxes.length > 0) {
          finalVariants = buildVariantCombinations(
            params.variantAxes,
            parseFloat(params.price) || 0,
            params.comparePrice.trim() ? parseFloat(params.comparePrice) : undefined,
            parseInt(params.stock) || 0,
            params.sku.trim(),
            parseInt(params.inventoryThreshold) || 0,
            []
          );
        }

        // Safeguard: If hasVariants is turned on but no variation values exist at all
        if (finalVariants.length === 0 && validAxes.length === 0) {
          toast.error('Please add variation values (e.g. Sizes or Colors) before saving, or uncheck "This product has multiple options".');
          setIsSubmitting(false);
          return;
        }
      }

      const computedStock = params.hasVariants
        ? finalVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parseInt(params.stock) || 0;

      const productPayload = {
        name: params.name.trim(),
        slug: params.slug.trim(),
        sku: params.sku.trim() || undefined,
        price: parseFloat(params.price) || 0,
        compare_price: params.comparePrice.trim() ? parseFloat(params.comparePrice) : undefined,
        cost: parseFloat(params.cost) || 0,
        category_id: params.selectedCategoryIds[0] || undefined,

        product_categories: params.selectedCategoryIds.map((categoryId) => ({
          product_id: params.isEdit && params.initialProduct ? params.initialProduct.id : '',
          category_id: categoryId,
        })),
        inventory_threshold: parseInt(params.inventoryThreshold) || 0,
        stock: computedStock,
        has_variants: params.hasVariants,
        is_service: params.isService,
        is_featured: params.isFeatured,
        is_active: params.isActive,
        enable_swatches: params.enableSwatches,
        show_swatches_on_archive: params.showSwatchesOnArchive,
        custom_badge_id: params.customBadgeId || undefined,
        badge_enabled: params.badgeEnabled,
        size_guide_id: params.sizeGuideId || undefined,
        frequently_bought_together_ids: params.frequentlyBoughtTogetherIds,
        flash_sale_enabled: params.flashSaleEnabled,
        flash_sale_start_date: params.flashSaleStartDate
          ? new Date(params.flashSaleStartDate).toISOString()
          : undefined,
        flash_sale_end_date: params.flashSaleEndDate
          ? new Date(params.flashSaleEndDate).toISOString()
          : undefined,
        flash_sale_discount_type: params.flashSaleDiscountType,
        flash_sale_discount_value: params.flashSaleDiscountValue,
        tags: parsedTags,
        description: params.description.trim() || undefined,
        short_description: params.shortDescription.trim() || undefined,
        rating: parseFloat(params.rating) || 5.0,
        reviews_count: parseInt(params.reviewsCount) || 0,
        variation_order: params.variantAxes.map((a: any) => a.type),
      };

      if (params.isEdit && params.initialProduct) {
        const result = await updateProductSafe(
          params.initialProduct.id,
          productPayload,
          params.images,
          finalVariants,
          params.modifiers
        );
        if (!result.success) {
          const msg = (typeof result.error === 'string' && result.error.trim())
            ? result.error.trim()
            : 'Failed to update product. Please check the product details and try again.';
          toast.error(msg);
          setIsSubmitting(false);
          return;
        }
        toast.success('Product updated successfully!');
        router.refresh();
      } else {
        const result = await createProductSafe(
          productPayload,
          params.images,
          finalVariants,
          params.modifiers
        );
        if (!result.success) {
          const msg = (typeof result.error === 'string' && result.error.trim())
            ? result.error.trim()
            : 'Failed to create product. Please check the product details and try again.';
          toast.error(msg);
          setIsSubmitting(false);
          return;
        }
        const newProduct = result.data;
        toast.success('Product created successfully!');
        router.push(`/admin/products/${newProduct.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      let errMsg = 'Failed to save product. An unexpected error occurred.';
      if (typeof err === 'string' && err.trim()) {
        errMsg = err.trim();
      } else if (err instanceof Error && err.message?.trim()) {
        errMsg = err.message.trim();
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}
