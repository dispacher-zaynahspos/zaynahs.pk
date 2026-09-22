'use client';

import React from 'react';
import { Product, StoreSettings } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { getSwatchClasses } from './ProductCardStyles';

export interface VariationGroup {
  type: 'color' | 'size' | 'material' | 'custom';
  name: string;
  variants: Product['variants'];
}

interface ProductCardSwatchesProps {
  availableGroups: VariationGroup[];
  currentVariant?: Product['variants'][0];
  settings?: StoreSettings | null;
  swatchAlign: string;
  shapeClass: string;
  archiveSwatchSize: string;
  onHoverImage: (url: string | null) => void;
  onSelectAttribute: (attr: 'color' | 'size' | 'material' | 'customValue', val: string) => void;
}

export const ProductCardSwatches: React.FC<ProductCardSwatchesProps> = ({
  availableGroups,
  currentVariant,
  settings,
  swatchAlign,
  shapeClass,
  archiveSwatchSize,
  onHoverImage,
  onSelectAttribute,
}) => {
  const isSwatchesEnabled = settings?.enableVariantSwatches !== false;
  const showVariation1 = isSwatchesEnabled && (settings?.card_show_swatches !== false);
  const showVariation2 = isSwatchesEnabled && (settings?.card_show_sizes !== false);
  const showVariation3 = isSwatchesEnabled && (settings?.card_show_materials !== false);
  const showVariation4 = isSwatchesEnabled && (settings?.card_show_custom !== false);
  const showVariation5 = isSwatchesEnabled && (settings?.card_show_custom_2 !== false);

  const renderedGroups: React.ReactNode[] = [];

  const renderGroupElement = (group: VariationGroup) => {
    if (group.type === 'color') {
      return (
        <div key="colors" className={`flex items-center gap-1.5 flex-wrap ${swatchAlign}`}>
          {group.variants.slice(0, settings?.swatchLimit ?? 8).map((v, i) => {
            const isActive = currentVariant?.color === v.color;
            const sSizeClass = getSwatchClasses('color', archiveSwatchSize, '');
            return (
              <button
                key={i}
                type="button"
                title={v.color}
                onMouseEnter={() => v.imageUrl ? onHoverImage(getPresetImageUrl(v.imageUrl, 'card')) : null}
                onMouseLeave={() => onHoverImage(null)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectAttribute('color', v.color || '');
                }}
                className={`
                  relative flex items-center justify-center cursor-pointer flex-shrink-0 overflow-hidden transition-all duration-150 border swatch-btn
                  ${sSizeClass} ${shapeClass}
                  shadow-sm ${isActive ? 'scale-110' : 'hover:scale-110'}
                `}
                style={{
                  ...getSwatchStyle(v.colorHex),
                  borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                  boxShadow: isActive ? '0 0 0 1.5px var(--color-accent)' : 'none',
                }}
              >
                {v.imageUrl && (v.showImageSwatch || !v.colorHex) && (
                  <img
                    src={v.imageUrl}
                    alt={v.color || ''}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
          {group.variants.length > (settings?.swatchLimit ?? 8) && (
            <span className="text-[10px] text-gray-400 font-semibold">
              +{group.variants.length - (settings?.swatchLimit ?? 8)}
            </span>
          )}
        </div>
      );
    } else {
      const attrKey = group.type === 'size' ? 'size' : group.type === 'material' ? 'material' : 'customValue';
      return (
        <div key={group.type} className={`flex items-center gap-1.5 flex-wrap ${swatchAlign}`}>
          {group.variants.slice(0, settings?.swatchLimit ?? 8).map((v, i) => {
            const val = group.type === 'size' ? v.size : group.type === 'material' ? v.material : v.customValue;
            const isActive = group.type === 'size'
              ? currentVariant?.size === v.size
              : group.type === 'material'
                ? currentVariant?.material === v.material
                : currentVariant?.customValue === v.customValue;
            const sSizeClass = getSwatchClasses('text', archiveSwatchSize, val || '');
            return (
              <button
                key={i}
                type="button"
                title={val || ''}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectAttribute(attrKey, val || '');
                }}
                className={`
                  relative flex items-center justify-center font-bold transition-all duration-150 cursor-pointer flex-shrink-0 overflow-hidden select-none border swatch-btn
                  ${sSizeClass} ${shapeClass}
                  ${isActive ? 'scale-110 shadow-sm font-black' : 'hover:scale-110'}
                `}
                style={{
                  borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                  color: isActive ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
                  boxShadow: isActive ? '0 0 0 1px var(--color-accent)' : 'none',
                }}
              >
                <span className="whitespace-nowrap leading-none text-center">{val}</span>
              </button>
            );
          })}
          {group.variants.length > (settings?.swatchLimit ?? 8) && (
            <span className="text-[9px] text-gray-400 font-semibold">
              +{group.variants.length - (settings?.swatchLimit ?? 8)}
            </span>
          )}
        </div>
      );
    }
  };

  if (showVariation1 && availableGroups[0]) {
    renderedGroups.push(renderGroupElement(availableGroups[0]));
  }
  if (showVariation2 && availableGroups[1]) {
    renderedGroups.push(renderGroupElement(availableGroups[1]));
  }
  if (showVariation3 && availableGroups[2]) {
    renderedGroups.push(renderGroupElement(availableGroups[2]));
  }
  if (showVariation4 && availableGroups[3]) {
    renderedGroups.push(renderGroupElement(availableGroups[3]));
  }
  if (showVariation5 && availableGroups[4]) {
    renderedGroups.push(renderGroupElement(availableGroups[4]));
  }

  const finalRenderedGroups = renderedGroups.slice(0, 2);

  if (finalRenderedGroups.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full mt-2 mb-2">
      {finalRenderedGroups}
    </div>
  );
};
