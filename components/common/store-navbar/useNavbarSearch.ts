'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import { Product } from '@/lib/types';

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

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(q))) ||
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
    }).slice(0, 5);
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
