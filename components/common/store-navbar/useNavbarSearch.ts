'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import { Product } from '@/lib/types';
import { rankProducts } from '@/lib/services/product-search/useInMemoryProductSearch';
import { expandSynonyms } from '@/components/store/shop-page/searchSynonyms';

export function useNavbarSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const searchOpen = useSearchStore((state) => state.isOpen);
  const setSearchOpen = useSearchStore((state) => state.setIsOpen);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchOpen && products.length === 0) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const { getProductsClient } = await import('@/lib/services/products-client');
          const data = await getProductsClient();
          setProducts(data);
        } catch (err) {
          console.error('Failed to load products for live search:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }
  }, [searchOpen, products.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || products.length === 0) return [];

    // Multi-word + synonym-aware match (same logic as /shop), then rank by the
    // shared engine (title-first). Top 5 for the dropdown.
    const words = q.split(/\s+/).filter(Boolean);
    const wordVariants = words.map((w) => expandSynonyms(w));

    const matched = products.filter((product) => {
      const name = product.name.toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const shortDesc = (product.short_description || '').toLowerCase();
      const sku = (product.sku || '').toLowerCase();
      const tags = (product.tags || []).map((t) => t.toLowerCase());
      const catName = (product.category?.name || '').toLowerCase();
      const relCat = (product.product_categories || [])
        .map((pc) => pc.category?.name?.toLowerCase())
        .filter(Boolean) as string[];
      const variantText = (product.variants || [])
        .filter((v) => v.active)
        .map((v) => [v.color, v.size, v.material, v.sku, v.custom_value].filter(Boolean).join(' ').toLowerCase());

      const matchesTerm = (term: string) =>
        name.includes(term) ||
        catName.includes(term) ||
        relCat.some((c) => c.includes(term)) ||
        tags.some((t) => t.includes(term)) ||
        shortDesc.includes(term) ||
        desc.includes(term) ||
        sku.includes(term) ||
        variantText.some((vt) => vt.includes(term));

      return wordVariants.every((variants) => variants.some((term) => matchesTerm(term)));
    });

    return rankProducts(matched, q).slice(0, 5);
  }, [products, searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    setSearchQuery('');
  }, [pathname, searchParams, setSearchQuery]);

  const handleCloseSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchInputRef,
    containerRef,
    products,
    loading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleCloseSearch,
  };
}
