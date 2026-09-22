'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronDown, Search } from '@/components/common/Icons';
import { Category, Product, NavigationItem } from '@/lib/types';

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenuItemId: string | null;
  menuItemLabel: string;
  setMenuItemLabel: (val: string) => void;
  menuItemLinkType: 'custom' | 'category' | 'product' | 'system';
  setMenuItemLinkType: (val: 'custom' | 'category' | 'product' | 'system') => void;
  menuItemUrl: string;
  setMenuItemUrl: (val: string) => void;
  menuItemCategoryId: string;
  setMenuItemCategoryId: (val: string) => void;
  menuItemProductId: string;
  setMenuItemProductId: (val: string) => void;
  menuItemSystemPage: 'home' | 'shop' | 'cart' | 'wishlist';
  setMenuItemSystemPage: (val: 'home' | 'shop' | 'cart' | 'wishlist') => void;
  categoriesList: Category[];
  productsList: Product[];
  navigationMenu: NavigationItem[];
  handleSaveMenuItem: () => void;
}

export default function MenuItemFormModal({
  isOpen,
  onClose,
  editingMenuItemId,
  menuItemLabel,
  setMenuItemLabel,
  menuItemLinkType,
  setMenuItemLinkType,
  menuItemUrl,
  setMenuItemUrl,
  menuItemCategoryId,
  setMenuItemCategoryId,
  menuItemProductId,
  setMenuItemProductId,
  menuItemSystemPage,
  setMenuItemSystemPage,
  categoriesList,
  productsList,
  navigationMenu,
  handleSaveMenuItem,
}: MenuItemFormModalProps) {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  const flattenedCategories = useMemo(() => {
    return categoriesList.map(c => ({ ...c, _level: 0 }));
  }, [categoriesList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const existingMenuUrls = useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.url) map.set(item.url, item.label);
        if (item.children && item.children.length > 0) traverse(item.children);
      }
    };
    traverse(navigationMenu);
    return map;
  }, [navigationMenu]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#16162a] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative scale-up">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            {editingMenuItemId ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Menu Label *</label>
            <input
              type="text"
              required
              placeholder="e.g. Track Suits"
              value={menuItemLabel}
              onChange={(e) => setMenuItemLabel(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Link Destination Type</label>
            <select
              value={menuItemLinkType}
              onChange={(e) => setMenuItemLinkType(e.target.value as any)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              <option value="custom">Custom URL Address</option>
              <option value="category">Link to a Category</option>
              <option value="product">Link to a Product</option>
              <option value="system">Standard System Page</option>
            </select>
          </div>

          {menuItemLinkType === 'custom' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">URL / Link Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. /custom-page or https://..."
                value={menuItemUrl}
                onChange={(e) => setMenuItemUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          )}

          {menuItemLinkType === 'category' && (
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Category *</label>
              <div
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center text-gray-900 dark:text-white"
              >
                <span className="truncate">
                  {menuItemCategoryId ? flattenedCategories.find(c => c.id === menuItemCategoryId)?.name : '-- Choose Category --'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              </div>

              {isCategoryDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl flex flex-col overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#1a1a2e] z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-xs focus:outline-none focus:ring-0 focus:border-[#e94560] text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto py-1 overscroll-contain">
                    <div
                      className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => { setMenuItemCategoryId(''); setIsCategoryDropdownOpen(false); }}
                    >
                      -- Choose Category --
                    </div>
                    {flattenedCategories
                      .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(c => {
                        const url = `/shop?category=${c.slug}`;
                        const existingLabel = existingMenuUrls.get(url);
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setMenuItemCategoryId(c.id);
                              setIsCategoryDropdownOpen(false);
                              setMenuItemLabel(c.name);
                            }}
                            className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3 ${menuItemCategoryId === c.id ? 'bg-[#e94560]/10 text-[#e94560] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              {c._level > 0 && <span className="text-gray-400">{'—'.repeat(c._level)} </span>}
                              {c.name}
                            </span>
                            {existingLabel && (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded text-[#e94560] shrink-0 border border-[#e94560]/20 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#e94560]"></span>
                                In /{existingLabel}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {menuItemLinkType === 'product' && (
            <div className="relative" ref={productDropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Product *</label>
              <div
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center text-gray-900 dark:text-white"
              >
                <span className="truncate">
                  {menuItemProductId ? productsList.find(p => p.id === menuItemProductId)?.name : '-- Choose Product --'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              </div>

              {isProductDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl flex flex-col overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#1a1a2e] z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-xs focus:outline-none focus:ring-0 focus:border-[#e94560] text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto py-1 overscroll-contain">
                    <div
                      className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => { setMenuItemProductId(''); setIsProductDropdownOpen(false); }}
                    >
                      -- Choose Product --
                    </div>
                    {productsList
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => {
                        const url = `/product/${p.slug}`;
                        const existingLabel = existingMenuUrls.get(url);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setMenuItemProductId(p.id);
                              setIsProductDropdownOpen(false);
                              setMenuItemLabel(p.name);
                            }}
                            className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3 ${menuItemProductId === p.id ? 'bg-[#e94560]/10 text-[#e94560] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            <span className="truncate">{p.name}</span>
                            {existingLabel && (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded text-[#e94560] shrink-0 border border-[#e94560]/20 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#e94560]"></span>
                                In /{existingLabel}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {menuItemLinkType === 'system' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Page *</label>
              <select
                value={menuItemSystemPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setMenuItemSystemPage(val as any);
                  const pageNames: Record<string, string> = {
                    home: 'Home',
                    shop: 'Shop',
                    cart: 'Cart',
                    wishlist: 'Wishlist'
                  };
                  if (pageNames[val]) {
                    setMenuItemLabel(pageNames[val]);
                  }
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="home">Home Page (Catalog Storefront)</option>
                <option value="shop">Shop Page (All Products & Filters)</option>
                <option value="cart">Cart Page</option>
                <option value="wishlist">Wishlist Page</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveMenuItem}
              className="px-4 py-2 rounded-xl bg-[#e94560] text-white text-xs font-bold hover:bg-[#d83a52] transition-all cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
