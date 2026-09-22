'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product, Category, Collection, StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { trackEvent } from '@/lib/trackEvent';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { useSettings } from '@/lib/hooks/useSettings';
import { SORT_OPTIONS, getSortLabel, toNumber, extractUsedVariants, filterProductsList } from './shopFilterUtils';
import { useShopUrlParamsSync } from './hooks/useShopUrlParamsSync';

export { SORT_OPTIONS, getSortLabel };

interface UseShopPageFiltersProps {
  initialProducts: Product[];
  categories: Category[];
  collections?: Collection[];
  settings: StoreSettings;
  isPreview?: boolean;
}

export function useShopPageFilters({
  initialProducts,
  categories,
  collections = [],
  settings,
  isPreview = false,
}: UseShopPageFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const addItem = useCartStore((state) => state.addItem);

  // Read URL query parameters
  const urlCategorySlug = searchParams.get('category') || undefined;
  const urlCollectionSlug = searchParams.get('collection') || undefined;
  const urlSearchQuery = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSortParam = searchParams.get('sort') || undefined;
  const urlAvailabilityParam = (searchParams.get('availability') || '').split(',').filter(Boolean);
  const urlMinPriceParam = searchParams.get('minPrice');
  const urlMaxPriceParam = searchParams.get('maxPrice');
  const PAGE_SIZE = 12;

  const SYSTEM_CATEGORY_ID = '00000000-0000-4000-8000-000000000099';

  const displayCategories = useMemo(() => {
    return categories.filter((c) => c.id !== SYSTEM_CATEGORY_ID);
  }, [categories]);

  const activeCategory = useMemo(() => {
    if (!urlCategorySlug) return undefined;
    if (urlCategorySlug === 'shop') return undefined;
    return displayCategories.find((c) => c.slug === urlCategorySlug);
  }, [urlCategorySlug, displayCategories]);

  const activeCollection = useMemo(() => {
    if (!urlCollectionSlug) return undefined;
    return collections.find((c) => c.slug === urlCollectionSlug);
  }, [urlCollectionSlug, collections]);

  // States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(activeCategory?.id);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(activeCollection?.id);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const defaultSort =
    activeCategory?.activeSortPreference ||
    categories.find((c) => c.id === SYSTEM_CATEGORY_ID)?.activeSortPreference ||
    'manual';
  const [sortBy, setSortBy] = useState<string>(
    urlSortParam && SORT_OPTIONS.some((o) => o.value === urlSortParam) ? urlSortParam : defaultSort
  );
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  const [isCollectionDescExpanded, setIsCollectionDescExpanded] = useState(false);
  const [isCategoryDescExpanded, setIsCategoryDescExpanded] = useState(false);

  const { settings: liveSettings } = useSettings(settings);
  const activeSettings = isPreview ? settings : (liveSettings ?? settings);

  useScrollRestoration();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allProducts = initialProducts;

  // Availability Filters
  const [availability, setAvailability] = useState({
    onSale: urlAvailabilityParam.includes('on-sale'),
    inStock: urlAvailabilityParam.includes('in-stock'),
    outStock: urlAvailabilityParam.includes('out-of-stock'),
  });

  // Calculate global min and max prices
  const priceLimits = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 10000 };
    const prices = allProducts.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  const [priceMin, setPriceMin] = useState<number>(() => toNumber(urlMinPriceParam, priceLimits.min));
  const [priceMax, setPriceMax] = useState<number>(() => toNumber(urlMaxPriceParam, priceLimits.max));
  const priceDirtyRef = useRef(false);

  // Dynamic extraction of active/used variants
  const usedVariants = useMemo(() => extractUsedVariants(allProducts), [allProducts]);

  // Variant Filter States
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Expansion States for Variant Filters
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((product) => {
      const categoryIds = new Set<string>();
      if (product.categoryId) categoryIds.add(product.categoryId);
      product.productCategories?.forEach((pc) => {
        categoryIds.add(pc.categoryId);
      });
      categoryIds.forEach((cid) => {
        counts[cid] = (counts[cid] || 0) + 1;
      });
    });
    return counts;
  }, [allProducts]);

  const featuredProducts = useMemo(() => {
    return allProducts.filter((p) => p.isFeatured).slice(0, 3);
  }, [allProducts]);

  const sliderRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return filterProductsList({
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
    });
  }, [
    allProducts,
    selectedCategoryId,
    selectedCollectionId,
    searchQuery,
    availability,
    priceMin,
    priceMax,
    sortBy,
    selectedColors,
    selectedSizes,
    selectedMaterials,
    activeCollection,
    collections,
  ]);

  const pageFromUrl = isNaN(urlPage) ? 1 : Math.max(1, urlPage);
  const targetLimitFromUrl = pageFromUrl * PAGE_SIZE;
  const [loadMoreLimit, setLoadMoreLimit] = useState(() => targetLimitFromUrl);

  useEffect(() => {
    setLoadMoreLimit((prev) => Math.max(prev, targetLimitFromUrl));
  }, [targetLimitFromUrl]);

  const displayProducts = useMemo(() => {
    return filteredProducts.slice(0, loadMoreLimit);
  }, [filteredProducts, loadMoreLimit]);

  const totalResults = filteredProducts.length;
  const hasMore = displayProducts.length < totalResults;
  const currentPage = Math.ceil(displayProducts.length / PAGE_SIZE);

  const {
    handleCategorySelect,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore,
    handleClearFilters,
  } = useShopUrlParamsSync({
    categories,
    displayCategories,
    collections,
    activeCategory,
    SYSTEM_CATEGORY_ID,
    urlCategorySlug,
    urlCollectionSlug,
    urlSearchQuery,
    priceLimits,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    priceDirtyRef,
    setSelectedCategoryId,
    setSelectedCollectionId,
    setSortBy,
    availability,
    setAvailability,
    setSearchQuery,
    setSelectedColors,
    setSelectedSizes,
    setSelectedMaterials,
    setShowAllColors,
    setShowAllSizes,
    setShowAllMaterials,
    setLoadMoreLimit,
    PAGE_SIZE,
    currentPage,
  });

  const sidebarProps = {
    allProductsCount: allProducts.length,
    displayCategories,
    selectedCategoryId,
    handleCategorySelect,
    categoryCounts,
    availability,
    handleAvailabilityChange,
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    priceLimits,
    priceDirtyRef,
    sliderRef,
    usedVariants,
    selectedColors,
    setSelectedColors,
    selectedSizes,
    setSelectedSizes,
    selectedMaterials,
    setSelectedMaterials,
    showAllColors,
    setShowAllColors,
    showAllSizes,
    setShowAllSizes,
    showAllMaterials,
    setShowAllMaterials,
    featuredProducts,
    settings: activeSettings,
  };

  return {
    addItem,
    searchParams,
    displayCategories,
    activeCategory,
    activeCollection,
    selectedCategoryId,
    selectedCollectionId,
    searchQuery,
    setSearchQuery,
    sortBy,
    viewMode,
    setViewMode,
    isCollectionDescExpanded,
    setIsCollectionDescExpanded,
    isCategoryDescExpanded,
    setIsCategoryDescExpanded,
    activeSettings,
    mobileFilterOpen,
    setMobileFilterOpen,
    availability,
    priceMin,
    priceMax,
    priceLimits,
    selectedColors,
    setSelectedColors,
    selectedSizes,
    setSelectedSizes,
    selectedMaterials,
    setSelectedMaterials,
    handleCategorySelect,
    filteredProducts,
    displayProducts,
    totalResults,
    hasMore,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore,
    handleClearFilters,
    sidebarProps,
  };
}
