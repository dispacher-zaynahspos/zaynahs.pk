import { CartItem, ProductVariant } from '@/lib/types';

export interface FormattedVariantChip {
  label: string;
  value: string;
  colorHex?: string;
}

export interface FormattedVariant {
  size?: string;
  color?: string;
  colorHex?: string;
  material?: string;
  customOption?: string;
  customValue?: string;
  sku?: string;
  imageUrl?: string;
  summary: string;
  shortSummary: string;
  chips: FormattedVariantChip[];
}

/**
 * Single source of truth (Rule SSOT1) for extracting and formatting
 * variant details from any CartItem or OrderItem across admin and storefront.
 * Resilient against snake_case, camelCase, and legacy data structures.
 */
export function getItemVariant(
  item: CartItem | (Record<string, unknown> & { selected_variant?: unknown; selectedVariant?: unknown; variant?: unknown })
): FormattedVariant {
  if (!item) {
    return { summary: '', shortSummary: '', chips: [] };
  }

  // Safe variant resolution across snake_case, camelCase, and legacy structures
  const rawVariant = (
    item.selected_variant ??
    (item as Record<string, unknown>).selectedVariant ??
    (item as Record<string, unknown>).variant
  ) as (ProductVariant & Record<string, unknown>) | undefined;

  if (!rawVariant || typeof rawVariant !== 'object') {
    // Check if variant attributes were stored directly on item (rare legacy edge case)
    const directSize = (item as Record<string, unknown>).size ? String((item as Record<string, unknown>).size).trim() : undefined;
    const directColor = (item as Record<string, unknown>).color ? String((item as Record<string, unknown>).color).trim() : undefined;
    const directSku = (item as Record<string, unknown>).sku ? String((item as Record<string, unknown>).sku).trim() : undefined;

    const chips: FormattedVariantChip[] = [];
    if (directColor) chips.push({ label: 'Color', value: directColor });
    if (directSize) chips.push({ label: 'Size', value: directSize });
    if (directSku) chips.push({ label: 'SKU', value: directSku });

    const parts = [directColor, directSize].filter(Boolean) as string[];
    return {
      size: directSize,
      color: directColor,
      sku: directSku,
      summary: parts.join(' · '),
      shortSummary: parts.join(' / '),
      chips,
    };
  }

  const size = rawVariant.size ? String(rawVariant.size).trim() : undefined;
  const color = rawVariant.color ? String(rawVariant.color).trim() : undefined;
  const colorHex = (rawVariant.color_hex ?? rawVariant.colorHex) ? String(rawVariant.color_hex ?? rawVariant.colorHex).trim() : undefined;
  const material = rawVariant.material ? String(rawVariant.material).trim() : undefined;
  const customOption = (rawVariant.custom_option ?? rawVariant.customOption)
    ? String(rawVariant.custom_option ?? rawVariant.customOption).trim()
    : undefined;
  const customValue = (rawVariant.custom_value ?? rawVariant.customValue)
    ? String(rawVariant.custom_value ?? rawVariant.customValue).trim()
    : undefined;
  const sku = rawVariant.sku ? String(rawVariant.sku).trim() : undefined;
  const imageUrl = (rawVariant.image_url ?? rawVariant.imageUrl)
    ? String(rawVariant.image_url ?? rawVariant.imageUrl).trim()
    : undefined;

  const chips: FormattedVariantChip[] = [];
  if (color) chips.push({ label: 'Color', value: color, colorHex });
  if (size) chips.push({ label: 'Size', value: size });
  if (material) chips.push({ label: 'Material', value: material });
  if (customValue) chips.push({ label: customOption || 'Option', value: customValue });
  if (sku) chips.push({ label: 'SKU', value: sku });

  const summaryParts = [
    color && `Color: ${color}`,
    size && `Size: ${size}`,
    material && `Material: ${material}`,
    customValue && `${customOption || 'Option'}: ${customValue}`,
  ].filter(Boolean) as string[];

  const shortParts = [color, size, customValue].filter(Boolean) as string[];

  return {
    size,
    color,
    colorHex,
    material,
    customOption,
    customValue,
    sku,
    imageUrl,
    summary: summaryParts.join(' · '),
    shortSummary: shortParts.join(' / '),
    chips,
  };
}
