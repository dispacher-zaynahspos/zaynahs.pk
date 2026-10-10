import { Product, Collection } from '@/lib/types';
import { applySort, SORT_OPTIONS as SHARED_SORT_OPTIONS, getSortLabel as sharedGetSortLabel } from '@/lib/sorting/sortOptions';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { rankProducts } from '@/lib/services/product-search/useInMemoryProductSearch';
import { expandSynonyms } from './searchSynonyms';

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
  const hasQuery = q.length > 0;
  if (hasQuery) {
    // Multi-word: every word must match somewhere. Each word is expanded with
    // its synonyms / Roman-Urdu equivalents (any one of them counts as a match).
    const words = q.split(/\s+/).filter(Boolean);
    const wordVariants = words.map((w) => expandSynonyms(w));

    list = list.filter((product) => {
      const name = product.name.toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const shortDesc = (product.short_description || '').toLowerCase();
      const sku = (product.sku || '').toLowerCase();
      const tags = (product.tags || []).map((t) => t.toLowerCase());
      const catName = (product.category?.name || '').toLowerCase();
      const relCatNames = (product.product_categories || [])
        .map((pc) => pc.category?.name?.toLowerCase())
        .filter(Boolean) as string[];
      const collectionNames = (collections || [])
        .filter((c) => {
          const ids = c.categories?.map((cat) => cat.id) || [];
          return (
            (product.category_id && ids.includes(product.category_id)) ||
            product.product_categories?.some((pc) => pc.category_id && ids.includes(pc.category_id))
          );
        })
        .map((c) => c.name.toLowerCase());
      const variantText = (product.variants || [])
        .filter((v) => v.active)
        .map((v) => [v.color, v.size, v.material, v.sku, v.custom_value].filter(Boolean).join(' ').toLowerCase());

      // haystacks for this product
      const matchesTerm = (term: string): boolean =>
        name.includes(term) ||
        catName.includes(term) ||
        relCatNames.some((c) => c.includes(term)) ||
        collectionNames.some((c) => c.includes(term)) ||
        tags.some((t) => t.includes(term)) ||
        shortDesc.includes(term) ||
        desc.includes(term) ||
        sku.includes(term) ||
        variantText.some((vt) => vt.includes(term));

      // every search word (via any of its synonyms) must match somewhere
      return wordVariants.every((variants) => variants.some((term) => matchesTerm(term)));
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

  // When a text query is active, rank by relevance (title → category → tags →
  // short desc → long desc → variant) via the shared SSOT ranker — same order
  // as the admin search engine. Facet-only browsing keeps the manual/applySort order.
  if (hasQuery) {
    return rankProducts(list, q);
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
