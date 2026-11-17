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

export interface ProductOptionAxis {
  name: string;
  count: number;
  values: string[];
}

export interface ProductOptionSummary {
  isSingle: boolean;
  label: string; // 'Single' | `${typeCount}x${totalOptions}`
  typeCount: number;
  totalOptions: number;
  totalStock: number;
  details: ProductOptionAxis[];
  tooltip: string;
}

/**
 * Extracts and calculates the canonical option architecture for a product (Rule SSOT1).
 * Formula:
 * - Simple direct-add-to-cart product -> 'Single'
 * - Variable product -> '{typeCount}x{totalOptions}' where typeCount is the number of
 *   distinct variable dimensions (e.g. Size, Color), and totalOptions is the total sum
 *   of all distinct choice values across all dimensions (e.g. 6 sizes = 1x6; 6 sizes + 3 colors = 2x9).
 */
export function getProductOptionSummary(product: {
  has_variants?: boolean | null;
  stock?: number | null;
  variants?: Array<{
    size?: string | null;
    color?: string | null;
    material?: string | null;
    custom_option?: string | null;
    custom_value?: string | null;
    stock?: number | null;
  }> | null;
  product_variants?: Array<{
    size?: string | null;
    color?: string | null;
    material?: string | null;
    custom_option?: string | null;
    custom_value?: string | null;
    stock?: number | null;
  }> | null;
}): ProductOptionSummary {
  const variants = product.product_variants || product.variants || [];
  const hasVariantsFlag = Boolean(product.has_variants || variants.length > 0);

  if (!hasVariantsFlag || variants.length === 0) {
    const stock = Number(product.stock ?? 0);
    return {
      isSingle: true,
      label: 'Single',
      typeCount: 0,
      totalOptions: 0,
      totalStock: stock,
      details: [],
      tooltip: `Single Item (Direct Add to Cart) • ${stock > 0 ? `${stock.toLocaleString()} in stock` : 'Out of stock'}`
    };
  }

  const sizes = new Set<string>();
  const colors = new Set<string>();
  const materials = new Set<string>();
  const customAxes = new Map<string, Set<string>>();

  for (const v of variants) {
    if (v.size && typeof v.size === 'string' && v.size.trim()) sizes.add(v.size.trim());
    if (v.color && typeof v.color === 'string' && v.color.trim()) colors.add(v.color.trim());
    if (v.material && typeof v.material === 'string' && v.material.trim()) materials.add(v.material.trim());
    if (v.custom_value && typeof v.custom_value === 'string' && v.custom_value.trim()) {
      const optName = (v.custom_option && typeof v.custom_option === 'string' && v.custom_option.trim()) || 'Custom';
      if (!customAxes.has(optName)) customAxes.set(optName, new Set());
      customAxes.get(optName)!.add(v.custom_value.trim());
    }
  }

  const axes: ProductOptionAxis[] = [];
  if (sizes.size > 0) axes.push({ name: 'Size', count: sizes.size, values: Array.from(sizes) });
  if (colors.size > 0) axes.push({ name: 'Color', count: colors.size, values: Array.from(colors) });
  if (materials.size > 0) axes.push({ name: 'Material', count: materials.size, values: Array.from(materials) });
  for (const [name, valSet] of customAxes.entries()) {
    if (valSet.size > 0) axes.push({ name, count: valSet.size, values: Array.from(valSet) });
  }

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  if (axes.length === 0) {
    return {
      isSingle: true,
      label: 'Single',
      typeCount: 0,
      totalOptions: 0,
      totalStock,
      details: [],
      tooltip: `Single Item • ${totalStock > 0 ? `${totalStock.toLocaleString()} in stock` : 'Out of stock'}`
    };
  }

  const typeCount = axes.length;
  const totalOptions = axes.reduce((sum, a) => sum + a.count, 0);
  const label = `${typeCount}x${totalOptions}`;
  const breakdownStr = axes.map(a => `${a.name}: ${a.count}`).join(', ');
  const tooltip = `${typeCount} Variable Type${typeCount > 1 ? 's' : ''}, ${totalOptions} Total Options (${breakdownStr}) • Total Stock: ${totalStock.toLocaleString()}`;

  return {
    isSingle: false,
    label,
    typeCount,
    totalOptions,
    totalStock,
    details: axes,
    tooltip
  };
}
