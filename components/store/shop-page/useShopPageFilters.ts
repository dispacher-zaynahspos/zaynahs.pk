'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product, Category, Collection, StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { SHOP_CATEGORY_ID as SYSTEM_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { trackEvent } from '@/lib/trackEvent';
import { useSettings } from '@/lib/hooks/useSettings';
import { SORT_OPTIONS, getSortLabel, toNumber, extractUsedVariants, filterProductsList } from './shopFilterUtils';
import { useShopUrlParamsSync } from './hooks/useShopUrlParamsSync';
import { useCatalogColumns } from '@/lib/hooks/useCatalogColumns';
import { SCROLL_KEY, isSameStorePath, ScrollRestoreData } from '@/lib/hooks/useScrollRestoration';
import { getNavigationSnapshot, saveNavigationSnapshot } from '@/lib/navigation/navigationMemory';

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

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  shirts: 'casual-double-shirts',
  shirt: 'casual-double-shirts',
  boys: 'boys-winter-collection',
  'boys-winter': 'Boys Winter Collections',
  'boys-winter-collections': 'Boys Winter Collections',
  hoodie: 'hoodies',
  sweatshirt: 'sweatshirts',
};

  const displayCategories = useMemo(() => {
    return categories.filter((c) => c.id !== SYSTEM_CATEGORY_ID);
  }, [categories]);

  const activeCategory = useMemo(() => {
    if (!urlCategorySlug) return undefined;
    const cleanSlug = urlCategorySlug.toLowerCase().trim();
    if (cleanSlug === 'shop') return undefined;

    // 1. Direct slug match (case-insensitive)
    const direct = displayCategories.find((c) => c.slug?.toLowerCase() === cleanSlug);
    if (direct) return direct;

    // 2. Alias mapping (e.g. 'shirts' -> 'casual-double-shirts', 'boys' -> 'boys-winter-collection')
    const aliasTarget = CATEGORY_SLUG_ALIASES[cleanSlug];
    if (aliasTarget) {
      const aliasMatch = displayCategories.find(
        (c) => c.slug?.toLowerCase() === aliasTarget.toLowerCase() || c.name?.toLowerCase() === aliasTarget.toLowerCase()
      );
      if (aliasMatch) return aliasMatch;
    }

    // 3. Name match (exact or hyphens to spaces)
    const normalizedName = cleanSlug.replace(/-/g, ' ');
    const nameMatch = displayCategories.find(
      (c) => c.name?.toLowerCase() === cleanSlug || c.name?.toLowerCase() === normalizedName
    );
    if (nameMatch) return nameMatch;

    // 4. Partial substring match (e.g. 'shirts' matches 'casual-double-shirts')
    const partial = displayCategories.find(
      (c) => c.slug?.toLowerCase().includes(cleanSlug) || c.name?.toLowerCase().includes(cleanSlug)
    );
    if (partial) return partial;

    return undefined;
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
    activeCategory?.active_sort_preference ||
    categories.find((c) => c.id === SYSTEM_CATEGORY_ID)?.active_sort_preference ||
    'manual';
  const [sortBy, setSortBy] = useState<string>(
    urlSortParam && SORT_OPTIONS.some((o) => o.value === urlSortParam) ? urlSortParam : defaultSort
  );
  const [viewMode, setViewModeRaw] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  // null = use the configured shop_columns_* settings. A number = explicit view-mode override
  // (set only when the user clicks the 3-up / 4-up quick toggles). This keeps the merchant's
  // saved desktop/tablet columns authoritative until the user explicitly overrides them.
  const [desktopColsOverride, setDesktopColsOverride] = useState<number | null>(null);
  const [tabletColsOverride, setTabletColsOverride] = useState<number | null>(null);
  const setViewMode = (mode: 'grid-3' | 'grid-4' | 'list') => {
    setViewModeRaw(mode);
    if (mode === 'grid-3') { setDesktopColsOverride(3); setTabletColsOverride(2); }
    else if (mode === 'grid-4') { setDesktopColsOverride(4); setTabletColsOverride(null); }
    else { setDesktopColsOverride(null); setTabletColsOverride(null); }
  };
  const [isCollectionDescExpanded, setIsCollectionDescExpanded] = useState(false);
  const [isCategoryDescExpanded, setIsCategoryDescExpanded] = useState(false);

  const { settings: liveSettings } = useSettings(settings);
  const activeSettings = isPreview ? settings : (liveSettings ?? settings);
  const [devicePageSize, setDevicePageSize] = useState<number>(() => {
    return Number(activeSettings?.shop_products_per_page) || 12;
  });

  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 640 && activeSettings?.shop_products_per_page_mobile) {
        setDevicePageSize(Number(activeSettings.shop_products_per_page_mobile));
      } else if (w >= 640 && w < 1024 && activeSettings?.shop_products_per_page_tablet) {
        setDevicePageSize(Number(activeSettings.shop_products_per_page_tablet));
      } else if (w >= 1024 && activeSettings?.shop_products_per_page_desktop) {
        setDevicePageSize(Number(activeSettings.shop_products_per_page_desktop));
      } else {
        setDevicePageSize(Number(activeSettings?.shop_products_per_page) || 12);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [
    activeSettings?.shop_products_per_page,
    activeSettings?.shop_products_per_page_desktop,
    activeSettings?.shop_products_per_page_tablet,
    activeSettings?.shop_products_per_page_mobile,
  ]);

  const PAGE_SIZE = devicePageSize;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allProducts = initialProducts;

  // Availability Filters
  const [availability, setAvailability] = useState({
    onSale: urlAvailabilityParam.includes('on-sale'),
    inStock: urlAvailabilityParam.includes('in-stock'),
    outStock: urlAvailabilityParam.includes('out-of-stock'),
  });

  // Calculate global min and max prices from initial products (for slider bounds)
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

  // Dynamic extraction of active/used variants from initial products (for sidebar filters)
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
      if (product.category_id) categoryIds.add(product.category_id);
      product.product_categories?.forEach((pc) => {
        categoryIds.add(pc.category_id);
      });
      categoryIds.forEach((cid) => {
        counts[cid] = (counts[cid] || 0) + 1;
      });
    });
    return counts;
  }, [allProducts]);

  const featuredProducts = useMemo(() => {
    return allProducts.filter((p) => p.is_featured).slice(0, 3);
  }, [allProducts]);

  const sliderRef = useRef<HTMLInputElement>(null);

  // SEARCH + FILTER (ONE client-side path for this catalog size).
  // The full catalog (initialProducts) is already in memory, so text search +
  // facet filters run together through filterProductsList — correct total count,
  // every matching field, no DB round-trip, no data-loss. Ranking (title-first)
  // is applied inside filterProductsList when a query is present.
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
  ]);

  const isSearching = false;
  const searchError: Error | null = null;
  const totalResults = filteredProducts.length;

  // Pagination mode: 'infinite' | 'load_more' | 'numbered' (legacy infinite flag kept in sync)
  const paginationMode: 'infinite' | 'load_more' | 'numbered' =
    activeSettings?.shop_pagination_mode
    || (activeSettings?.shop_infinite_scroll ? 'infinite' : 'load_more');

  const pageFromUrl = isNaN(urlPage) ? 1 : Math.max(1, urlPage);
  const targetLimitFromUrl = pageFromUrl * PAGE_SIZE;

  // Shop page load-more limit — URL drives initial value (page=N * PAGE_SIZE).
  // BACK NAV RESTORE (Problem B fix): When user clicks Load More N times, goes into
  // a product, then presses Back — the shop remounts with PAGE_SIZE items only.
  // The clicked card (#product-card-id) no longer exists, so ScrollRestorer falls back
  // to scrollY clamped to the short page → footer/banner. Fix: save loadMoreLimit to
  // sessionStorage on every change, restore it on back navigation so ALL batches are
  // in the DOM immediately when the page remounts. ScrollRestorer then finds the card.
  //
  // HYDRATION-SAFE: useState initializer runs only on client. We read sessionStorage
  // here directly (not in a useEffect) because useState initializer is never called
  // on the server — no hydration mismatch. This gives us the correct item count on
  // the FIRST render, so the card exists in DOM immediately when ScrollRestorer runs.
  const SHOP_LIMIT_KEY = `shop_load_more_limit:${typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''}`;

  const [loadMoreLimit, setLoadMoreLimit] = useState<number>(() => {
    // On initial render (SSR pass): use URL-driven value
    if (typeof window === 'undefined') return targetLimitFromUrl;
    // Check if this is a back navigation
    try {
      const currentPath = window.location.pathname + (window.location.search || '');
      const snap = getNavigationSnapshot(currentPath);
      if (snap?.loadMoreLimits?.shop) {
        return Math.max(snap.loadMoreLimits.shop, targetLimitFromUrl);
      }
      const rawScroll = sessionStorage.getItem(SCROLL_KEY);
      let isReturnNav = false;
      if (rawScroll) {
        const scrollData: ScrollRestoreData = JSON.parse(rawScroll);
        if (
          isSameStorePath(scrollData?.path, currentPath) &&
          scrollData?.timestamp &&
          Date.now() - scrollData.timestamp < 30 * 60 * 1000
        ) {
          isReturnNav = true;
        }
      }
      if (!isReturnNav) {
        const navEntries = performance?.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
        if (navEntries?.[0]?.type === 'back_forward') isReturnNav = true;
      }
      if (!isReturnNav) {
        const cleanSearch = window.location.search.replace(/^\?/, '');
        const liveKey = `scroll:${window.location.pathname}?${cleanSearch}`;
        if (sessionStorage.getItem(liveKey)) isReturnNav = true;
      }
      if (isReturnNav) {
        const saved = sessionStorage.getItem(SHOP_LIMIT_KEY);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (Number.isFinite(parsed) && parsed > 0) return Math.max(parsed, targetLimitFromUrl);
        }
      }
    } catch {}
    return targetLimitFromUrl;
  });

  // Persist loadMoreLimit to sessionStorage and navigationMemory snapshot
  useEffect(() => {
    try {
      sessionStorage.setItem(SHOP_LIMIT_KEY, String(loadMoreLimit));
      saveNavigationSnapshot({ loadMoreLimits: { shop: loadMoreLimit } });
    } catch {}
  // SHOP_LIMIT_KEY is derived from pathname+search and stable within a page session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreLimit]);

  // Fill-rows (RULE DS24): round the cumulative visible count up to a full row so
  // the last row is never half-empty when more products exist. Default ON.
  const fillRowsEnabled = activeSettings?.shop_fill_rows !== false;
  const { fill, columns } = useCatalogColumns({
    mode: activeSettings?.shop_columns_mode || 'manual',
    mobile: activeSettings?.shop_columns_mobile || 2,
    tablet: tabletColsOverride ?? activeSettings?.shop_columns_tablet ?? 3,
    desktop: desktopColsOverride ?? activeSettings?.shop_columns_desktop ?? 4,
    wide: activeSettings?.shop_columns_wide,
    minDesktop: activeSettings?.shop_min_card_desktop,
  });

  const effectivePageSize = fillRowsEnabled && columns > 1
    ? Math.ceil(PAGE_SIZE / columns) * columns
    : PAGE_SIZE;

  const totalPages = Math.max(1, Math.ceil(totalResults / effectivePageSize));
  const numberedPage = Math.min(pageFromUrl, totalPages);

  const displayProducts = useMemo(() => {
    if (paginationMode === 'numbered') {
      // Show ONLY the current page slice (classic 1 2 3 pagination), aligned to full rows
      const start = (numberedPage - 1) * effectivePageSize;
      return filteredProducts.slice(start, start + effectivePageSize);
    }
    // infinite / load_more: cumulative slice, rounded up to a full row
    const visible = fill(loadMoreLimit, filteredProducts.length, fillRowsEnabled);
    return filteredProducts.slice(0, visible);
  }, [filteredProducts, loadMoreLimit, paginationMode, numberedPage, effectivePageSize, fill, fillRowsEnabled]);

  // hasMore only applies to infinite + load_more (numbered uses page buttons)
  const hasMore = paginationMode !== 'numbered' && displayProducts.length < totalResults;

  const currentPage = paginationMode === 'numbered'
    ? numberedPage
    : Math.ceil(displayProducts.length / effectivePageSize);

  const {
    handleCategorySelect,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore,
    handleGoToPage,
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

  // Single Load More path (client list drives both browse + search).
  const handleLoadMoreWrapper = handleLoadMore;

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
    defaultSort,
    viewMode,
    setViewMode,
    desktopColsOverride,
    tabletColsOverride,
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
    isSearching,
    paginationMode,
    currentPage,
    totalPages,
    handleGoToPage,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore: handleLoadMoreWrapper,
    handleClearFilters,
    sidebarProps,
  };
}