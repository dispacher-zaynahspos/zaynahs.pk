'use client';

import React from 'react';
import { ProductVariant, StoreSettings } from '@/lib/types';
import { getSwatchStyle, extractColorsFromName } from '@/lib/utils/swatch';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { useVariantSelectorState } from './variant-selector/useVariantSelectorState';
import { getSwatchClasses } from './variant-selector/swatchStyles';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onChangeSelectedVariant: (variant?: ProductVariant) => void;
  enableSwatches?: boolean;
  settings?: StoreSettings | null;
  variationOrder?: string[];
  onPreviewImage?: (url: string) => void;
}

const DEFAULT_AXIS_ORDER = ['color', 'size', 'material', 'custom'];
const UNSELECTED_SWATCH_BORDER = 'var(--swatch-border-unselected, color-mix(in srgb, currentColor 28%, rgba(0, 0, 0, 0.22)))';

export default function VariantSelector({
  variants,
  selectedVariant,
  onChangeSelectedVariant,
  enableSwatches,
  settings,
  variationOrder,
  onPreviewImage,
}: VariantSelectorProps) {
  const {
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
  } = useVariantSelectorState({
    variants,
    selectedVariant,
    onChangeSelectedVariant,
  });

  const showSwatches = (enableSwatches !== false) && (settings?.enable_variant_swatches ?? true);

  // Responsive PDP Swatch Size (Desktop, Tablet, Mobile)
  const responsiveSwatchSizes = {
    mobile: settings?.product_swatch_size_mobile || settings?.product_swatch_size || 'md',
    tablet: settings?.product_swatch_size_tablet || settings?.product_swatch_size || 'md',
    desktop: settings?.product_swatch_size_desktop || settings?.product_swatch_size || 'md',
  };

  // Dedicated PDP Swatch Shape (Circle vs Box/Square)
  const productSwatchShape = settings?.product_swatch_shape || settings?.swatch_shape || 'circle';
  const shapeMap: Record<string, string> = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };
  const shapeClass = shapeMap[productSwatchShape] || shapeMap.circle;

  // Responsive PDP Swatch Alignment (Desktop, Tablet, Mobile)
  const alignMob = settings?.product_swatch_align_mobile || settings?.product_swatch_align || 'left';
  const alignTab = settings?.product_swatch_align_tablet || settings?.product_swatch_align || 'left';
  const alignDesk = settings?.product_swatch_align_desktop || settings?.product_swatch_align || 'left';

  const rowAlignClass = `
    ${alignMob === 'center' ? 'justify-center' : alignMob === 'right' ? 'justify-end' : 'justify-start'}
    ${alignTab === 'center' ? 'md:justify-center' : alignTab === 'right' ? 'md:justify-end' : 'md:justify-start'}
    ${alignDesk === 'center' ? 'lg:justify-center' : alignDesk === 'right' ? 'lg:justify-end' : 'lg:justify-start'}
  `.trim();

  const labelAlignClass = `
    ${alignMob === 'center' ? 'text-center' : alignMob === 'right' ? 'text-right' : 'text-left'}
    ${alignTab === 'center' ? 'md:text-center' : alignTab === 'right' ? 'md:text-right' : 'md:text-left'}
    ${alignDesk === 'center' ? 'lg:text-center' : alignDesk === 'right' ? 'lg:text-right' : 'lg:text-left'}
  `.trim();

  // Helper: manual axis selection handlers without auto-selection fallbacks
  const handleColorClick = (color: string) => {
    setSelectedColor(color);

    // If a size was already selected, check if valid combination exists with this new color
    if (selectedSize && sizes.length > 0) {
      const exists = activeVariants.some(v =>
        v.color === color &&
        v.size === selectedSize &&
        (!materials.length || v.material === selectedMaterial) &&
        (!customValues.length || v.custom_value === selectedCustomValue)
      );
      if (!exists) {
        setSelectedSize(undefined);
      }
    }

    if (onPreviewImage) {
      const imgVar = activeVariants.find(v => v.color === color && v.image_url);
      if (imgVar?.image_url) {
        onPreviewImage(imgVar.image_url);
      }
    }
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);

    // If a color was already selected, check if valid combination exists with this new size
    if (selectedColor && colors.length > 0) {
      const exists = activeVariants.some(v =>
        v.color === selectedColor &&
        v.size === size &&
        (!materials.length || v.material === selectedMaterial) &&
        (!customValues.length || v.custom_value === selectedCustomValue)
      );
      if (!exists) {
        setSelectedColor(undefined);
      }
    }
  };

  const handleMaterialClick = (mat: string) => {
    setSelectedMaterial(mat);
    if (selectedSize && sizes.length > 0) {
      const exists = activeVariants.some(v =>
        (!colors.length || v.color === selectedColor) &&
        v.size === selectedSize &&
        v.material === mat &&
        (!customValues.length || v.custom_value === selectedCustomValue)
      );
      if (!exists) {
        setSelectedSize(undefined);
      }
    }
  };

  const handleCustomClick = (val: string) => {
    setSelectedCustomValue(val);
  };

  const order = variationOrder || DEFAULT_AXIS_ORDER;

  const sectionMap: Record<string, { hasValues: boolean; label: string; selectedLabel: string | undefined; render: () => React.ReactNode }> = {
    color: {
      hasValues: colors.length > 0,
      label: 'Color',
      selectedLabel: selectedColor,
      render: () => (
        <div className={`flex flex-wrap items-center gap-2.5 ${rowAlignClass}`}>
          {colors.map(color => {
            const matchVar = activeVariants.find(v => v.color === color);
            const isSelected = selectedColor === color;
            const resolvedHex = matchVar?.color_hex || (color ? extractColorsFromName(color) : undefined);

            const isColorAvailable = !selectedSize || activeVariants.some(v => v.size === selectedSize && v.color === color);
            const isColorInStock = selectedSize
              ? activeVariants.some(v => v.size === selectedSize && v.color === color && v.stock > 0)
              : activeVariants.some(v => v.color === color && v.stock > 0);
            const colorTitle = !isColorAvailable ? `${color} (Unavailable)` : !isColorInStock ? `${color} (Out of Stock)` : color;

            if (showSwatches && matchVar && (resolvedHex || matchVar.image_url)) {
              const sSizeClass = getSwatchClasses('color', responsiveSwatchSizes, '');
              const isImageSwatch = Boolean(
                (matchVar.show_image_swatch && matchVar.image_url) ||
                (!resolvedHex && matchVar.image_url)
              );
              const swatchBg = isImageSwatch ? {} : getSwatchStyle(resolvedHex);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorClick(color)}
                  title={colorTitle}
                  aria-label={colorTitle}
                  className={`
                    relative flex items-center justify-center cursor-pointer border transition-all duration-200 swatch-btn
                    ${sSizeClass} ${shapeClass}
                    ${isSelected ? 'scale-110 shadow-md' : 'hover:scale-105'}
                    ${!isColorAvailable || !isColorInStock ? 'opacity-40' : ''}
                    overflow-hidden
                  `}
                  style={{
                    ...swatchBg,
                    borderColor: isSelected ? 'var(--color-accent, var(--color-primary, #ef4444))' : UNSELECTED_SWATCH_BORDER,
                    boxShadow: isSelected ? '0 0 0 2px var(--color-accent, var(--color-primary, #ef4444))' : 'none',
                  }}
                >
                  {isImageSwatch && matchVar.image_url && (
                    <img
                      src={getPresetImageUrl(matchVar.image_url, 'card')}
                      alt={color}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={color}
                type="button"
                onClick={() => handleColorClick(color)}
                title={colorTitle}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${!isColorAvailable || !isColorInStock ? 'opacity-40' : ''}`}
                style={{
                  backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--btn-primary-text)' : 'var(--color-text-primary)',
                  borderColor: isSelected ? 'var(--btn-primary-bg)' : UNSELECTED_SWATCH_BORDER,
                }}
              >
                {color}
              </button>
            );
          })}
        </div>
      ),
    },
    size: {
      hasValues: sizes.length > 0,
      label: 'Size',
      selectedLabel: selectedSize,
      render: () => (
        <div className={`flex flex-wrap gap-2 ${rowAlignClass}`}>
          {sizes.map(size => {
            const isSelected = selectedSize === size;
            const sSizeClass = getSwatchClasses('text', responsiveSwatchSizes, size);

            const isSizeAvailable = !selectedColor || activeVariants.some(v => v.color === selectedColor && v.size === size);
            const isSizeInStock = selectedColor
              ? activeVariants.some(v => v.color === selectedColor && v.size === size && v.stock > 0)
              : activeVariants.some(v => v.size === size && v.stock > 0);
            const sizeTitle = !isSizeAvailable ? `${size} (Unavailable)` : !isSizeInStock ? `${size} (Out of Stock)` : size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeClick(size)}
                title={sizeTitle}
                className={showSwatches ? `
                  relative flex items-center justify-center font-bold border transition-all duration-200 cursor-pointer overflow-hidden select-none swatch-btn
                  ${sSizeClass} ${shapeClass}
                  ${isSelected ? 'scale-105 shadow-sm font-black' : 'hover:scale-105'}
                  ${!isSizeAvailable || !isSizeInStock ? 'opacity-40' : ''}
                ` : `min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${!isSizeAvailable || !isSizeInStock ? 'opacity-40' : ''}`}
                style={showSwatches ? {
                  borderColor: isSelected ? 'var(--color-accent)' : UNSELECTED_SWATCH_BORDER,
                  color: isSelected ? 'var(--color-text-accent)' : 'var(--color-text-primary)',
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
                  boxShadow: isSelected ? '0 0 0 1.5px var(--color-accent)' : 'none',
                } : {
                  backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--btn-primary-text)' : 'var(--color-text-primary)',
                  borderColor: isSelected ? 'var(--btn-primary-bg)' : UNSELECTED_SWATCH_BORDER,
                  boxShadow: isSelected ? '0 0 0 2px var(--btn-primary-bg)' : 'none'
                }}
              >
                <span className={`whitespace-nowrap leading-none text-center ${!isSizeAvailable || !isSizeInStock ? 'line-through decoration-red-400' : ''}`}>{size}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    material: {
      hasValues: materials.length > 0,
      label: 'Material',
      selectedLabel: selectedMaterial,
      render: () => (
        <div className={`flex flex-wrap gap-2 ${rowAlignClass}`}>
          {materials.map(mat => {
            const isSelected = selectedMaterial === mat;
            const sSizeClass = getSwatchClasses('text', responsiveSwatchSizes, mat);
            return (
              <button
                key={mat}
                type="button"
                onClick={() => handleMaterialClick(mat)}
                className={showSwatches ? `
                  relative flex items-center justify-center font-bold border transition-all duration-200 cursor-pointer overflow-hidden select-none swatch-btn
                  ${sSizeClass} ${shapeClass}
                  ${isSelected ? 'scale-105 shadow-sm font-black' : 'hover:scale-105'}
                ` : `min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer`}
                style={showSwatches ? {
                  borderColor: isSelected ? 'var(--color-accent)' : UNSELECTED_SWATCH_BORDER,
                  color: isSelected ? 'var(--color-text-accent)' : 'var(--color-text-primary)',
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
                  boxShadow: isSelected ? '0 0 0 1.5px var(--color-accent)' : 'none',
                } : {
                  backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--btn-primary-text)' : 'var(--color-text-primary)',
                  borderColor: isSelected ? 'var(--btn-primary-bg)' : UNSELECTED_SWATCH_BORDER,
                  boxShadow: isSelected ? '0 0 0 2px var(--btn-primary-bg)' : 'none'
                }}
              >
                <span className="whitespace-nowrap leading-none text-center">{mat}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    custom: {
      hasValues: !!customOptionName && customValues.length > 0,
      label: customOptionName || 'Custom',
      selectedLabel: selectedCustomValue,
      render: () => (
        <div className={`flex flex-wrap gap-2 ${rowAlignClass}`}>
          {customValues.map(val => {
            const isSelected = selectedCustomValue === val;
            const sSizeClass = getSwatchClasses('text', responsiveSwatchSizes, val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleCustomClick(val)}
                className={showSwatches ? `
                  relative flex items-center justify-center font-bold border transition-all duration-200 cursor-pointer overflow-hidden select-none swatch-btn
                  ${sSizeClass} ${shapeClass}
                  ${isSelected ? 'scale-105 shadow-sm font-black' : 'hover:scale-105'}
                ` : `min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer`}
                style={showSwatches ? {
                  borderColor: isSelected ? 'var(--color-accent)' : UNSELECTED_SWATCH_BORDER,
                  color: isSelected ? 'var(--color-text-accent)' : 'var(--color-text-primary)',
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
                  boxShadow: isSelected ? '0 0 0 1.5px var(--color-accent)' : 'none',
                } : {
                  backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--btn-primary-text)' : 'var(--color-text-primary)',
                  borderColor: isSelected ? 'var(--btn-primary-bg)' : UNSELECTED_SWATCH_BORDER,
                  boxShadow: isSelected ? '0 0 0 2px var(--btn-primary-bg)' : 'none'
                }}
              >
                <span className="whitespace-nowrap leading-none text-center">{val}</span>
              </button>
            );
          })}
        </div>
      ),
    },
  };

  return (
    <div className="space-y-5">
      {order.map(axisType => {
        const section = sectionMap[axisType];
        if (!section || !section.hasValues) return null;
        return (
          <div key={axisType} className={labelAlignClass}>
            <div className={`flex items-center gap-2 mb-2.5 ${rowAlignClass}`}>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{section.label}</span>
              {section.selectedLabel && (
                <span className="text-xs font-bold text-[#1a1a2e] dark:text-white">: {section.selectedLabel}</span>
              )}
            </div>
            {section.render()}
          </div>
        );
      })}
    </div>
  );
}
