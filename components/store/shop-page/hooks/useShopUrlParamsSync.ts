'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Category, Collection } from '@/lib/types';
import { trackEvent } from '@/lib/trackEvent';
import { SORT_OPTIONS, toNumber } from '../shopFilterUtils';

interface UseShopUrlParamsSyncProps {
  categories: Category[];
  displayCategories: Category[];
  collections: Collection[];
  activeCategory?: Category;
  SYSTEM_CATEGORY_ID: string;
  urlCategorySlug?: string;
  urlCollectionSlug?: string;
  urlSearchQuery: string;
  priceLimits: { min: number; max: number };
  priceMin: number;
  setPriceMin: (val: number) => void;
  priceMax: number;
  setPriceMax: (val: number) => void;
  priceDirtyRef: React.MutableRefObject<boolean>;
  setSelectedCategoryId: (id: string | undefined) => void;
  setSelectedCollectionId: (id: string | undefined) => void;
  setSortBy: (sort: string) => void;
  availability: { onSale: boolean; inStock: boolean; outStock: boolean };
  setAvailability: React.Dispatch<React.SetStateAction<{ onSale: boolean; inStock: boolean; outStock: boolean }>>;
  setSearchQuery: (q: string) => void;
  setSelectedColors: (colors: string[]) => void;
  setSelectedSizes: (sizes: string[]) => void;
  setSelectedMaterials: (materials: string[]) => void;
  setShowAllColors: (val: boolean) => void;
  setShowAllSizes: (val: boolean) => void;
  setShowAllMaterials: (val: boolean) => void;
  setLoadMoreLimit: React.Dispatch<React.SetStateAction<number>>;
  PAGE_SIZE: number;
  currentPage: number;
}

export function useShopUrlParamsSync({
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
}: UseShopUrlParamsSyncProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (priceDirtyRef.current) return;
    if (searchParams.has('minPrice') || searchParams.has('maxPrice')) return;
    setPriceMin(priceLimits.min);
    setPriceMax(priceLimits.max);
  }, [priceLimits, searchParams, priceDirtyRef, setPriceMin, setPriceMax]);

  useEffect(() => {
    if (!urlCategorySlug || urlCategorySlug === 'shop') {
      setSelectedCategoryId(undefined);
    } else {
      const cat = displayCategories.find((c) => c.slug === urlCategorySlug);
      setSelectedCategoryId(cat?.id);
    }
  }, [urlCategorySlug, displayCategories, setSelectedCategoryId]);

  useEffect(() => {
    if (!urlCollectionSlug) {
      setSelectedCollectionId(undefined);
    } else {
      const col = collections.find((c) => c.slug === urlCollectionSlug);
      setSelectedCollectionId(col?.id);
    }
  }, [urlCollectionSlug, collections, setSelectedCollectionId]);

  useEffect(() => {
    const urlSort = searchParams.get('sort');
    if (urlSort && SORT_OPTIONS.some((o) => o.value === urlSort)) {
      setSortBy(urlSort);
    } else {
      const preference =
        activeCategory?.activeSortPreference ||
        categories.find((c) => c.id === SYSTEM_CATEGORY_ID)?.activeSortPreference ||
        'manual';
      setSortBy(preference);
    }
  }, [activeCategory, categories, searchParams, SYSTEM_CATEGORY_ID, setSortBy]);

  useEffect(() => {
    const flags = (searchParams.get('availability') || '').split(',').filter(Boolean);
    setAvailability({
      onSale: flags.includes('on-sale'),
      inStock: flags.includes('in-stock'),
      outStock: flags.includes('out-of-stock'),
    });
  }, [searchParams, setAvailability]);

  useEffect(() => {
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');
    if (minP !== null || maxP !== null) {
      priceDirtyRef.current = true;
      if (minP !== null) setPriceMin(toNumber(minP, priceLimits.min));
      if (maxP !== null) setPriceMax(toNumber(maxP, priceLimits.max));
    }
  }, [searchParams, priceLimits, priceDirtyRef, setPriceMin, setPriceMax]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const minActive = priceMin > priceLimits.min;
      const maxActive = priceMax < priceLimits.max;
      if (minActive) params.set('minPrice', String(priceMin));
      else params.delete('minPrice');
      if (maxActive) params.set('maxPrice', String(priceMax));
      else params.delete('maxPrice');
      if (minActive || maxActive) params.delete('page');
      const next = params.toString();
      if (next !== searchParams.toString()) {
        router.replace(`${pathname}?${next}`, { scroll: false });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [priceMin, priceMax, priceLimits, searchParams, pathname, router]);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
    if (urlSearchQuery) {
      trackEvent('Search', { search_string: urlSearchQuery });
    }
  }, [urlSearchQuery, setSearchQuery]);

  const handleCategorySelect = (categoryId: string | undefined, keepCollection?: boolean) => {
    setSelectedCategoryId(categoryId);
    const slug = categoryId ? displayCategories.find((c) => c.id === categoryId)?.slug : undefined;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (slug) {
      params.set('category', slug);
      if (!keepCollection) {
        params.delete('collection');
      }
    } else {
      params.delete('category');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'manual') params.delete('sort');
    else params.set('sort', value);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setLoadMoreLimit(PAGE_SIZE);
  };

  const handleAvailabilityChange = (key: 'onSale' | 'inStock' | 'outStock', checked: boolean) => {
    const next = { ...availability, [key]: checked };
    setAvailability(next);
    const params = new URLSearchParams(searchParams.toString());
    const flags: string[] = [];
    if (next.onSale) flags.push('on-sale');
    if (next.inStock) flags.push('in-stock');
    if (next.outStock) flags.push('out-of-stock');
    if (flags.length > 0) params.set('availability', flags.join(','));
    else params.delete('availability');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setLoadMoreLimit(PAGE_SIZE);
  };

  const removeSortPill = () => {
    const preference =
      activeCategory?.activeSortPreference ||
      categories.find((c) => c.id === SYSTEM_CATEGORY_ID)?.activeSortPreference ||
      'manual';
    setSortBy(preference);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setLoadMoreLimit(PAGE_SIZE);
  };

  const removePricePill = () => {
    priceDirtyRef.current = false;
    setPriceMin(priceLimits.min);
    setPriceMax(priceLimits.max);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setLoadMoreLimit(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    } else {
      params.delete('page');
    }
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    setLoadMoreLimit(nextPage * PAGE_SIZE);
  };

  const handleClearFilters = () => {
    setSelectedCategoryId(undefined);
    setSelectedCollectionId(undefined);
    setSearchQuery('');
    setAvailability({ onSale: false, inStock: false, outStock: false });
    priceDirtyRef.current = false;
    setPriceMin(priceLimits.min);
    setPriceMax(priceLimits.max);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setShowAllColors(false);
    setShowAllSizes(false);
    setShowAllMaterials(false);
    const preference =
      activeCategory?.activeSortPreference ||
      categories.find((c) => c.id === SYSTEM_CATEGORY_ID)?.activeSortPreference ||
      'manual';
    setSortBy(preference);
    setLoadMoreLimit(PAGE_SIZE);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('availability');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('search');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    handleCategorySelect,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore,
    handleClearFilters,
  };
}
