'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function useOrderCreateProducts(isOpen: boolean) {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active selection states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chosenSize, setChosenSize] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [chosenVariantId, setChosenVariantId] = useState('');
  const [chosenQuantity, setChosenQuantity] = useState('1');
  const [customUnitPrice, setCustomUnitPrice] = useState('');

  // Load products from DB on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, slug, price, compare_price, sku, stock, has_variants,
            images:product_images(id, url, sort_order, is_primary),
            variants:product_variants(id, color, size, stock, price, sku, active)
          `)
          .eq('is_active', true);

        if (error) throw error;

        if (data) {
          const mapped: Product[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price ? parseFloat(p.price.toString()) : 0,
            comparePrice: p.compare_price ? parseFloat(p.compare_price.toString()) : undefined,
            sku: p.sku || undefined,
            stock: p.stock || 0,
            hasVariants: p.has_variants || false,
            isService: false,
            isFeatured: false,
            isActive: true,
            enableSwatches: false,
            showSwatchesOnArchive: false,
            tags: [],
            images: (p.images || []).map((img: any) => ({
              id: img.id,
              productId: p.id,
              url: img.url,
              sortOrder: img.sort_order || 0,
              isPrimary: img.is_primary || false
            })),
            variants: (p.variants || []).filter((v: any) => v.active).map((v: any) => ({
              id: v.id,
              productId: p.id,
              color: v.color || undefined,
              size: v.size || undefined,
              stock: v.stock || 0,
              price: v.price ? parseFloat(v.price.toString()) : undefined,
              sku: v.sku || undefined,
              active: v.active || false,
              sortOrder: 0
            })),
            modifiers: [],
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: p.updated_at || new Date().toISOString()
          }));
          setDbProducts(mapped);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products list');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  // Click outside search dropdown close handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search
  const filteredProducts = dbProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q)) ||
    (p.variants && p.variants.some(v => 
      (v.sku && v.sku.toLowerCase().includes(q)) ||
      (v.color && v.color.toLowerCase().includes(q)) ||
      (v.size && v.size.toLowerCase().includes(q)) ||
      (v.material && v.material.toLowerCase().includes(q)) ||
      (v.customValue && v.customValue.toLowerCase().includes(q))
    ));
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setIsDropdownOpen(false);
    setChosenSize('');
    setChosenColor('');
    setChosenVariantId('');
    setChosenQuantity('1');
    setCustomUnitPrice(product.price.toString());
  };

  return {
    dbProducts,
    isLoadingProducts,
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    selectedProduct,
    setSelectedProduct,
    chosenSize,
    setChosenSize,
    chosenColor,
    setChosenColor,
    chosenVariantId,
    setChosenVariantId,
    chosenQuantity,
    setChosenQuantity,
    customUnitPrice,
    setCustomUnitPrice,
    filteredProducts,
    handleProductSelect,
  };
}
