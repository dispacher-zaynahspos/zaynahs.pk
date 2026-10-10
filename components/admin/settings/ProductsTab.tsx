'use client';

import React from 'react';
import { ProductsDesignCatalogSection } from './products/ProductsDesignCatalogSection';
import { VariantSwatchDisplaySection } from './products/VariantSwatchDisplaySection';

interface ProductsTabProps {
  enableVariantSwatches: boolean;
  setEnableVariantSwatches: (val: boolean) => void;
  swatchShape: 'circle' | 'square';
  setSwatchShape: (val: 'circle' | 'square') => void;
  swatchLimit: number;
  setSwatchLimit: (val: number) => void;
  archiveSwatchSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  setArchiveSwatchSize: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  archiveSwatchSizeDesktop?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeDesktop?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  archiveSwatchSizeTablet?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeTablet?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  archiveSwatchSizeMobile?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeMobile?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  swatchLimitDesktop?: number | null;
  setSwatchLimitDesktop?: (val: number | null) => void;
  swatchLimitTablet?: number | null;
  setSwatchLimitTablet?: (val: number | null) => void;
  swatchLimitMobile?: number | null;
  setSwatchLimitMobile?: (val: number | null) => void;
  archiveSwatchAlign: 'left' | 'center' | 'right';
  setArchiveSwatchAlign: (val: 'left' | 'center' | 'right') => void;
  archiveSwatchAlignDesktop?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignDesktop?: (val: 'left' | 'center' | 'right' | null) => void;
  archiveSwatchAlignTablet?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignTablet?: (val: 'left' | 'center' | 'right' | null) => void;
  archiveSwatchAlignMobile?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignMobile?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  setProductSwatchSize: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  productSwatchSizeDesktop?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeDesktop?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchSizeTablet?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeTablet?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchSizeMobile?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeMobile?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchAlign?: 'left' | 'center' | 'right';
  setProductSwatchAlign?: (val: 'left' | 'center' | 'right') => void;
  productSwatchAlignDesktop?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignDesktop?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchAlignTablet?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignTablet?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchAlignMobile?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignMobile?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchShape?: 'circle' | 'square';
  setProductSwatchShape?: (val: 'circle' | 'square') => void;
  defaultVariantIndex: number;
  setDefaultVariantIndex: (val: number) => void;
  imageHoverStyle: 'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none';
  setImageHoverStyle: (val: 'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none') => void;
  imageAspectRatio: string;
  setImageAspectRatio: (val: string) => void;
  titleLineLimit: '1' | '2' | 'none';
  setTitleLineLimit: (val: '1' | '2' | 'none') => void;
  cardShowDescription: boolean;
  setCardShowDescription: (val: boolean) => void;
  cardShowSwatches: boolean;
  setCardShowSwatches: (val: boolean) => void;
  cardShowSizes: boolean;
  setCardShowSizes: (val: boolean) => void;
  cardShowMaterials: boolean;
  setCardShowMaterials: (val: boolean) => void;
  cardShowCustom: boolean;
  setCardShowCustom: (val: boolean) => void;
  cardShowCustom2: boolean;
  setCardShowCustom2: (val: boolean) => void;
  cardShowTypeColor: boolean;
  setCardShowTypeColor: (val: boolean) => void;
  cardShowTypeSize: boolean;
  setCardShowTypeSize: (val: boolean) => void;
  cardShowTypeMaterial: boolean;
  setCardShowTypeMaterial: (val: boolean) => void;
  cardShowTypeCustom: boolean;
  setCardShowTypeCustom: (val: boolean) => void;
  cardMobileColumns: number;
  setCardMobileColumns: (val: number) => void;
  addToCartAnimation?: string;
  setAddToCartAnimation?: (val: string) => void;
  enableFlyToCart?: boolean;
  setEnableFlyToCart?: (val: boolean) => void;
}

export default function ProductsTab(props: ProductsTabProps) {
  return (
    <div className="space-y-8">
      <VariantSwatchDisplaySection {...props} />

      <ProductsDesignCatalogSection
        imageHoverStyle={props.imageHoverStyle}
        setImageHoverStyle={props.setImageHoverStyle}
        imageAspectRatio={props.imageAspectRatio}
        setImageAspectRatio={props.setImageAspectRatio}
        titleLineLimit={props.titleLineLimit}
        setTitleLineLimit={props.setTitleLineLimit}
        cardMobileColumns={props.cardMobileColumns}
        setCardMobileColumns={props.setCardMobileColumns}
        cardShowDescription={props.cardShowDescription}
        setCardShowDescription={props.setCardShowDescription}
        addToCartAnimation={props.addToCartAnimation}
        setAddToCartAnimation={props.setAddToCartAnimation}
        enableFlyToCart={props.enableFlyToCart}
        setEnableFlyToCart={props.setEnableFlyToCart}
      />
    </div>
  );
}
