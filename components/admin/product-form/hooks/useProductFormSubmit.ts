'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { createProductSafe, updateProductSafe } from '@/lib/services/products/actions';
import { toast } from 'sonner';

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

      const computedStock = params.hasVariants
        ? params.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parseInt(params.stock) || 0;

      const productPayload = {
        name: params.name.trim(),
        slug: params.slug.trim(),
        sku: params.sku.trim() || undefined,
        price: parseFloat(params.price) || 0,
        comparePrice: params.comparePrice.trim() ? parseFloat(params.comparePrice) : undefined,
        cost: parseFloat(params.cost) || 0,
        categoryId: params.selectedCategoryIds[0] || undefined,

        productCategories: params.selectedCategoryIds.map((categoryId) => ({
          productId: params.isEdit && params.initialProduct ? params.initialProduct.id : '',
          categoryId,
        })),
        inventoryThreshold: parseInt(params.inventoryThreshold) || 0,
        stock: computedStock,
        hasVariants: params.hasVariants,
        isService: params.isService,
        isFeatured: params.isFeatured,
        isActive: params.isActive,
        enableSwatches: params.enableSwatches,
        showSwatchesOnArchive: params.showSwatchesOnArchive,
        customBadgeId: params.customBadgeId || undefined,
        badgeEnabled: params.badgeEnabled,
        sizeGuideId: params.sizeGuideId || undefined,
        frequentlyBoughtTogetherIds: params.frequentlyBoughtTogetherIds,
        flashSaleEnabled: params.flashSaleEnabled,
        flashSaleStartDate: params.flashSaleStartDate
          ? new Date(params.flashSaleStartDate).toISOString()
          : undefined,
        flashSaleEndDate: params.flashSaleEndDate
          ? new Date(params.flashSaleEndDate).toISOString()
          : undefined,
        flashSaleDiscountType: params.flashSaleDiscountType,
        flashSaleDiscountValue: params.flashSaleDiscountValue,
        tags: parsedTags,
        description: params.description.trim() || undefined,
        shortDescription: params.shortDescription.trim() || undefined,
        rating: parseFloat(params.rating) || 5.0,
        reviewsCount: parseInt(params.reviewsCount) || 0,
        variationOrder: params.variantAxes.map((a: any) => a.type),
      };

      if (params.isEdit && params.initialProduct) {
        const result = await updateProductSafe(
          params.initialProduct.id,
          productPayload,
          params.images,
          params.variants,
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
          params.variants,
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
