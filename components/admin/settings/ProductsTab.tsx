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
  archiveSwatchAlign: 'left' | 'center' | 'right';
  setArchiveSwatchAlign: (val: 'left' | 'center' | 'right') => void;
  productSwatchSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  setProductSwatchSize: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  defaultVariantIndex: number;
  setDefaultVariantIndex: (val: number) => void;
  imageHoverStyle: 'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none';
  setImageHoverStyle: (val: any) => void;
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
      />
    </div>
  );
}
