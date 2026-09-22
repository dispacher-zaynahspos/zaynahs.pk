import { Product, Collection } from '@/lib/types';

export const SORT_OPTIONS = [
  { value: 'manual', label: 'Manual Order' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'alpha_asc', label: 'Alphabetically: A-Z' },
  { value: 'alpha_desc', label: 'Alphabetically: Z-A' },
];

export const getSortLabel = (value: string) => SORT_OPTIONS.find((o) => o.value === value)?.label || value;

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
          if (variant.colorHex) {
            colorToHex[colorName] = variant.colorHex;
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
        (p.categoryId && collectionCategoryIds.includes(p.categoryId)) ||
        p.productCategories?.some((pc) => pc.categoryId && collectionCategoryIds.includes(pc.categoryId))
    );
  }

  if (selectedCategoryId) {
    list = list.filter(
      (p) =>
        (p.categoryId && p.categoryId === selectedCategoryId) ||
        p.productCategories?.some((pc) => pc.categoryId === selectedCategoryId)
    );
  }

  const q = searchQuery.toLowerCase().trim();
  if (q) {
    list = list.filter((product) => {
      const matchesCollection = collections?.some((c) => {
        if (!c.name.toLowerCase().includes(q)) return false;
        const collectionCategoryIds = c.categories?.map((cat) => cat.id) || [];
        return (
          (product.categoryId && collectionCategoryIds.includes(product.categoryId)) ||
          product.productCategories?.some((pc) => pc.categoryId && collectionCategoryIds.includes(pc.categoryId))
        );
      });

      return (
        product.name.toLowerCase().includes(q) ||
        matchesCollection ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
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
                (v.customValue && v.customValue.toLowerCase().includes(q)))
          ))
      );
    });
  }

  if (availability.onSale || availability.inStock || availability.outStock) {
    list = list.filter((product) => {
      const isOnSale = product.comparePrice && product.comparePrice > product.price;
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

  if (sortBy === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'alpha_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'alpha_desc') {
    list.sort((a, b) => b.name.localeCompare(a.name));
  }

  return list;
}
