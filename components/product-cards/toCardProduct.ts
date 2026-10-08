import type { Product, StoreSettings } from '@/lib/types';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { extractColorsFromName } from '@/lib/utils/swatch';
import type { CardProduct } from './types';

const fallbackPlaceholder = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23f3f4f6\'/%3E%3C/svg%3E';

export function toCardProduct(product: Product, settings?: StoreSettings | null): CardProduct {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const defaultIndex = Math.max(0, (settings?.default_variant_index || 1) - 1);
  const defaultVariant = activeVariants[defaultIndex] || activeVariants[0];
  const activePrices = activeVariants.map((variant) => variant.price).filter((price): price is number => typeof price === 'number' && price > 0);
  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : product.price;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : product.price;
  const uniqueColorVariants = activeVariants
    .filter((variant) => Boolean(variant.color))
    .reduce<typeof activeVariants>((acc, variant) => {
      const existing = acc.find((entry) => entry.color === variant.color);
      if (!existing) {
        acc.push({ ...variant });
      } else {
        if (!existing.color_hex && variant.color_hex) existing.color_hex = variant.color_hex;
        if (!existing.image_url && variant.image_url) existing.image_url = variant.image_url;
        if (!existing.show_image_swatch && variant.show_image_swatch) existing.show_image_swatch = variant.show_image_swatch;
      }
      return acc;
    }, []);
  const swatches = uniqueColorVariants.map((variant) => {
    const resolvedHex = variant.color_hex || (variant.color ? extractColorsFromName(variant.color) : undefined);
    const colors = resolvedHex?.split(',').map((color) => color.trim()).filter(Boolean) || [];
    return {
      color: colors[0] || (variant.image_url ? `url("${getPresetImageUrl(variant.image_url, 'card')}") center/cover` : '#888888'),
      color2: colors[1],
      image: variant.image_url ? getPresetImageUrl(variant.image_url, 'card') : undefined,
    };
  });
  const uniqueSizes = Array.from(new Set(activeVariants.map((variant) => variant.size).filter(Boolean))) as string[];
  const primaryImage = getPresetImageUrl(product.images?.find((image) => image.is_primary)?.url || product.images?.[0]?.url || fallbackPlaceholder, 'card');
  const secondaryImage = product.images.length > 1 ? getPresetImageUrl(product.images[1]?.url || product.images[0]?.url || fallbackPlaceholder, 'card') : null;

  return {
    id: product.id,
    href: `/product/${encodeURIComponent(product.slug || '')}`,
    title: product.name,
    vendor: product.category?.name,
    description: product.short_description || '',
    price: defaultVariant?.price && defaultVariant.price > 0 ? defaultVariant.price : product.price,
    compareAt: defaultVariant?.compare_price && defaultVariant.compare_price > 0 ? defaultVariant.compare_price : product.compare_price,
    hasPriceRange: minPrice !== maxPrice,
    hasMoreSizes: uniqueSizes.length > 4,
    badge: product.custom_badge?.name || undefined,
    image: primaryImage,
    image2: secondaryImage,
    rating: product.rating,
    reviewCount: product.reviews_count,
    swatches,
    source: product,
  };
}
