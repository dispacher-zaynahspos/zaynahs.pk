import { Product, Collection } from '@/lib/types';
import { applySort, SORT_OPTIONS as SHARED_SORT_OPTIONS, getSortLabel as sharedGetSortLabel } from '@/lib/sorting/sortOptions';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';

/**
 * Re-export the SSOT sort options/labels so existing imports keep working.
 * The ONLY definition lives in lib/sorting/sortOptions.ts.
 */
export const SORT_OPTIONS = SHARED_SORT_OPTIONS;
export const getSortLabel = sharedGetSortLabel;

export const toNumber = (v: string | null, fallback: number) => {
  const n = Number(v);
  return v && !isNaN(n) ? n : fallback;
};

export function extractUsedVariants(allProducts: Product[]) {
  const colorsSet = new Set<string>();
  const sizesSet = new Set<string>();
  const materialsSet = new Set<string>();
  const colorToHex: Record<string, string> = {};

  allProducts.forEach((product) => {
    product.variants?.forEach((variant) => {
      if (!variant.active) return;
      if (variant.color) {
        const colorName = variant.color.trim();
        if (colorName) {
          colorsSet.add(colorName);
          if (variant.color_hex) {
            colorToHex[colorName] = variant.color_hex;
          }
        }
      }
      if (variant.size) {
        const sizeName = variant.size.trim();
        if (sizeName) sizesSet.add(sizeName);
      }
      if (variant.material) {
        const materialName = variant.material.trim();
        if (materialName) materialsSet.add(materialName);
      }
    });
  });

  return {
    colors: Array.from(colorsSet).sort(),
    sizes: Array.from(sizesSet).sort(),
    materials: Array.from(materialsSet).sort(),
    colorToHex,
  };
}

interface FilterProductsOptions {
  allProducts: Product[];
  selectedCategoryId?: string;
  selectedCollectionId?: string;
  activeCollection?: Collection;
  collections?: Collection[];
  searchQuery: string;
  availability: { onSale: boolean; inStock: boolean; outStock: boolean };
  priceMin: number;
  priceMax: number;
  selectedColors: string[];
  selectedSizes: string[];
  selectedMaterials: string[];
  sortBy: string;
}

export function filterProductsList({
  allProducts,
  selectedCategoryId,
  selectedCollectionId,
  activeCollection,
  collections,
  searchQuery,
  availability,
  priceMin,
  priceMax,
  selectedColors,
  selectedSizes,
  selectedMaterials,
  sortBy,
}: FilterProductsOptions): Product[] {
  let list = [...allProducts];

  if (selectedCollectionId && activeCollection) {
    const collectionCategoryIds = activeCollection.categories?.map((c) => c.id) || [];
    list = list.filter(
      (p) =>
        (p.category_id && collectionCategoryIds.includes(p.category_id)) ||
        p.product_categories?.some((pc) => pc.category_id && collectionCategoryIds.includes(pc.category_id))
    );
  }

  if (selectedCategoryId) {
    list = list.filter(
      (p) =>
        (p.category_id && p.category_id === selectedCategoryId) ||
        p.product_categories?.some((pc) => pc.category_id === selectedCategoryId)
    );
  }

  const q = searchQuery.toLowerCase().trim();
  if (q) {
    list = list.filter((product) => {
      const matchesCollection = collections?.some((c) => {
        if (!c.name.toLowerCase().includes(q)) return false;
        const collectionCategoryIds = c.categories?.map((cat) => cat.id) || [];
        return (
          (product.category_id && collectionCategoryIds.includes(product.category_id)) ||
          product.product_categories?.some((pc) => pc.category_id && collectionCategoryIds.includes(pc.category_id))
        );
      });

      return (
        product.name.toLowerCase().includes(q) ||
        matchesCollection ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.short_description && product.short_description.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.tags && product.tags.some((t) => t.toLowerCase().includes(q))) ||
        (product.category?.name && product.category.name.toLowerCase().includes(q)) ||
        (product.variants &&
          product.variants.some(
            (v) =>
              v.active &&
              ((v.color && v.color.toLowerCase().includes(q)) ||
                (v.size && v.size.toLowerCase().includes(q)) ||
                (v.material && v.material.toLowerCase().includes(q)) ||
                (v.sku && v.sku.toLowerCase().includes(q)) ||
                (v.custom_value && v.custom_value.toLowerCase().includes(q)))
          ))
      );
    });
  }

  if (availability.onSale || availability.inStock || availability.outStock) {
    list = list.filter((product) => {
      const isOnSale = product.compare_price && product.compare_price > product.price;
      const isInStock = product.stock > 0;
      if (availability.onSale && !isOnSale) return false;
      if (availability.inStock && !isInStock) return false;
      if (availability.outStock && isInStock) return false;
      return true;
    });
  }

  list = list.filter((p) => p.price >= priceMin && p.price <= priceMax);

  if (selectedColors.length > 0) {
    list = list.filter((product) =>
      product.variants?.some((v) => v.active && v.color && selectedColors.includes(v.color.trim()))
    );
  }

  if (selectedSizes.length > 0) {
    list = list.filter((product) =>
      product.variants?.some((v) => v.active && v.size && selectedSizes.includes(v.size.trim()))
    );
  }

  if (selectedMaterials.length > 0) {
    list = list.filter((product) =>
      product.variants?.some((v) => v.active && v.material && selectedMaterials.includes(v.material.trim()))
    );
  }

  // Manual order: use THIS category's per-category position (SSOT), not a global rank.
  // When a category is selected, read product_categories[].position for that category.
  // On the all-products /shop view, fall back to the Shop system category position.
  let manualPositions: Record<string, number> | undefined;
  if (sortBy === 'manual') {
    const scopeCategoryId = selectedCategoryId || SHOP_CATEGORY_ID;
    manualPositions = {};
    for (const p of list) {
      const rel = p.product_categories?.find((pc) => pc.category_id === scopeCategoryId);
      const pos = rel?.position;
      if (typeof pos === 'number') manualPositions[p.id] = pos;
    }
  }

  return applySort(list, sortBy, manualPositions);
}
