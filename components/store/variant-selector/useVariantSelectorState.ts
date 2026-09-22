'use client';

import React from 'react';
import { ProductVariant } from '@/lib/types';

interface UseVariantSelectorStateProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onChangeSelectedVariant: (variant: ProductVariant) => void;
}

export function useVariantSelectorState({
  variants,
  selectedVariant,
  onChangeSelectedVariant,
}: UseVariantSelectorStateProps) {
  const activeVariants = React.useMemo(() => variants.filter(v => v.active), [variants]);

  const colors = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.color).filter(Boolean))) as string[], [activeVariants]);
  const sizes = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.size).filter(Boolean))) as string[], [activeVariants]);
  const materials = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.material).filter(Boolean))) as string[], [activeVariants]);

  const customOptionName = activeVariants[0]?.customOption;
  const customValues = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.customValue).filter(Boolean))) as string[], [activeVariants]);

  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(selectedVariant?.color);
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(selectedVariant?.size);
  const [selectedMaterial, setSelectedMaterial] = React.useState<string | undefined>(selectedVariant?.material);
  const [selectedCustomValue, setSelectedCustomValue] = React.useState<string | undefined>(selectedVariant?.customValue);

  React.useEffect(() => {
    if (selectedVariant) {
      setSelectedColor(selectedVariant.color);
      setSelectedSize(selectedVariant.size);
      setSelectedMaterial(selectedVariant.material);
      setSelectedCustomValue(selectedVariant.customValue);
    }
  }, [selectedVariant]);

  React.useEffect(() => {
    // Only auto-match when ALL required axes have been selected by user
    const colorOk = !colors.length || !!selectedColor;
    const sizeOk = !sizes.length || !!selectedSize;
    const materialOk = !materials.length || !!selectedMaterial;
    const customOk = !customValues.length || !!selectedCustomValue;
    if (!colorOk || !sizeOk || !materialOk || !customOk) return;

    const match = activeVariants.find(v => {
      const colorMatch = !colors.length || v.color === selectedColor;
      const sizeMatch = !sizes.length || v.size === selectedSize;
      const materialMatch = !materials.length || v.material === selectedMaterial;
      const customMatch = !customValues.length || v.customValue === selectedCustomValue;
      return colorMatch && sizeMatch && materialMatch && customMatch;
    });
    if (match && (!selectedVariant || match.id !== selectedVariant.id)) {
      onChangeSelectedVariant(match);
    }
  }, [selectedColor, selectedSize, selectedMaterial, selectedCustomValue, activeVariants, colors.length, sizes.length, materials.length, customValues.length, selectedVariant, onChangeSelectedVariant]);

  return {
    activeVariants,
    colors,
    sizes,
    materials,
    customOptionName,
    customValues,
    selectedColor, setSelectedColor,
    selectedSize, setSelectedSize,
    selectedMaterial, setSelectedMaterial,
    selectedCustomValue, setSelectedCustomValue,
  };
}
