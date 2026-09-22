'use client';

import React from 'react';
import { Plus } from '@/components/common/Icons';
import { Category, Product, NavigationItem } from '@/lib/types';
import { MenuTreeRenderer, MenuItemFormModal } from './navigation';

interface NavigationTabProps {
  headerDesktopMenuAlign: 'left' | 'center' | 'right' | 'hidden';
  setHeaderDesktopMenuAlign: (val: 'left' | 'center' | 'right' | 'hidden') => void;
  navigationMenu: NavigationItem[];
  openAddMenuModal: (parentId: string | null) => void;
  moveMenuItemUp: (id: string) => void;
  moveMenuItemDown: (id: string) => void;
  indentMenuItem: (id: string) => void;
  outdentMenuItem: (id: string) => void;
  openEditMenuModal: (item: NavigationItem, depth: number, id: string) => void;
  deleteMenuItem: (id: string) => void;
  
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (val: boolean) => void;
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
  handleSaveMenuItem: () => void;
  editingMenuItemId: string | null;
}

export default function NavigationTab({
  headerDesktopMenuAlign,
  setHeaderDesktopMenuAlign,
  navigationMenu,
  openAddMenuModal,
  moveMenuItemUp,
  moveMenuItemDown,
  indentMenuItem,
  outdentMenuItem,
  openEditMenuModal,
  deleteMenuItem,
  isMenuModalOpen,
  setIsMenuModalOpen,
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
  handleSaveMenuItem,
  editingMenuItemId,
}: NavigationTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Store Navigation Menu Customizer</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Build multi-level nested menus, sort items up/down, and link directly to categories, products, or custom URLs.</p>
          </div>
          <button
            type="button"
            onClick={() => openAddMenuModal(null)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e94560] text-white hover:bg-[#d83a52] transition-colors text-xs font-bold shrink-0 self-start sm:self-center cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Desktop Menu Alignment</label>
          <select
            value={headerDesktopMenuAlign}
            onChange={(e) => setHeaderDesktopMenuAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="left">Left Aligned</option>
            <option value="center">Center Aligned (Default)</option>
            <option value="right">Right Aligned</option>
            <option value="hidden">Hidden / No Desktop Menu</option>
          </select>
        </div>

        <div className="space-y-3">
          {navigationMenu.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-[#0f0f1b]/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              No custom menu items. Add items to build your menu.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/5 dark:bg-white/1">
              <MenuTreeRenderer
                items={navigationMenu}
                moveMenuItemUp={moveMenuItemUp}
                moveMenuItemDown={moveMenuItemDown}
                indentMenuItem={indentMenuItem}
                outdentMenuItem={outdentMenuItem}
                openAddMenuModal={openAddMenuModal}
                openEditMenuModal={openEditMenuModal}
                deleteMenuItem={deleteMenuItem}
              />
            </div>
          )}
        </div>
      </div>

      <MenuItemFormModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        editingMenuItemId={editingMenuItemId}
        menuItemLabel={menuItemLabel}
        setMenuItemLabel={setMenuItemLabel}
        menuItemLinkType={menuItemLinkType}
        setMenuItemLinkType={setMenuItemLinkType}
        menuItemUrl={menuItemUrl}
        setMenuItemUrl={setMenuItemUrl}
        menuItemCategoryId={menuItemCategoryId}
        setMenuItemCategoryId={setMenuItemCategoryId}
        menuItemProductId={menuItemProductId}
        setMenuItemProductId={setMenuItemProductId}
        menuItemSystemPage={menuItemSystemPage}
        setMenuItemSystemPage={setMenuItemSystemPage}
        categoriesList={categoriesList}
        productsList={productsList}
        navigationMenu={navigationMenu}
        handleSaveMenuItem={handleSaveMenuItem}
      />
    </div>
  );
}

