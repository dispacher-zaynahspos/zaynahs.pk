export { ProductGrid as EllaProductGrid } from './ProductGrid';
export { ProductCard as EllaProductCard } from './ProductCard';
export { toCardProduct } from './toCardProduct';
import { normalizeCardStyle } from '@/lib/utils/cardStyles';
import type { CardProduct, CardVariant, ProductCardSettings } from './types';

export type { CardProduct, CardVariant, ProductCardSettings };

export function getEllaCardVariant(style?: string | null): CardVariant | null {
  const normalized = normalizeCardStyle(style);
  const match = /^card_ella_(\d{2})$/.exec(normalized);
  if (!match) return null;
  const id = match[1];
  if (id >= '01' && id <= '08') return id as CardVariant;
  return null;
}
