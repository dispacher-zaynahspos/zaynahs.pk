'use client';

import { useState } from 'react';
import { NavigationItem, Category, Product } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';
import { findNodeAndParent, deepCloneMenu } from '../index';

interface UseSettingsNavigationProps {
  initialNavigationMenu?: NavigationItem[];
}

export function useSettingsNavigation({ initialNavigationMenu = [] }: UseSettingsNavigationProps) {
  const { confirm } = useConfirm();

  const [navigationMenu, setNavigationMenu] = useState<NavigationItem[]>(initialNavigationMenu);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [menuItemParentId, setMenuItemParentId] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Menu modal form state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuItemLabel, setMenuItemLabel] = useState('');
  const [menuItemUrl, setMenuItemUrl] = useState('');
  const [menuItemLinkType, setMenuItemLinkType] = useState<'custom' | 'category' | 'product' | 'system'>('custom');
  const [menuItemCategoryId, setMenuItemCategoryId] = useState('');
  const [menuItemProductId, setMenuItemProductId] = useState('');
  const [menuItemSystemPage, setMenuItemSystemPage] = useState<'home' | 'shop' | 'cart' | 'wishlist'>('home');

  const moveMenuItemUp = (id: string) => {
    const updatedMenu = deepCloneMenu(navigationMenu);
    const { index, siblings } = findNodeAndParent(updatedMenu, id);
    if (index > 0 && siblings.length > 0) {
      const temp = siblings[index];
      siblings[index] = siblings[index - 1];
      siblings[index - 1] = temp;
      setNavigationMenu(updatedMenu);
    }
  };

  const moveMenuItemDown = (id: string) => {
    const updatedMenu = deepCloneMenu(navigationMenu);
    const { index, siblings } = findNodeAndParent(updatedMenu, id);
    if (index !== -1 && index < siblings.length - 1) {
      const temp = siblings[index];
      siblings[index] = siblings[index + 1];
      siblings[index + 1] = temp;
      setNavigationMenu(updatedMenu);
    }
  };

  const indentMenuItem = (id: string) => {
    const updatedMenu = deepCloneMenu(navigationMenu);
    const { index, siblings } = findNodeAndParent(updatedMenu, id);
    if (index > 0) {
      const targetItem = siblings[index];
      const prevSibling = siblings[index - 1];
      if (!prevSibling.children) {
        prevSibling.children = [];
      }
      prevSibling.children.push(targetItem);
      siblings.splice(index, 1);
      setNavigationMenu(updatedMenu);
    }
  };

  const outdentMenuItem = (id: string) => {
    const updatedMenu = deepCloneMenu(navigationMenu);
    const { node, parent, siblings, index } = findNodeAndParent(updatedMenu, id);
    if (parent) {
      const parentInfo = findNodeAndParent(updatedMenu, parent.id);
      if (parentInfo.siblings) {
        siblings.splice(index, 1);
        parentInfo.siblings.splice(parentInfo.index + 1, 0, node!);
        setNavigationMenu(updatedMenu);
      }
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this menu item and all its sub-menu items?',
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    const updatedMenu = deepCloneMenu(navigationMenu);
    const { siblings, index } = findNodeAndParent(updatedMenu, id);
    if (index !== -1) {
      siblings.splice(index, 1);
      setNavigationMenu(updatedMenu);
    }
  };

  const openAddMenuModal = (parentId: string | null = null) => {
    setEditingMenuItemId(null);
    setMenuItemParentId(parentId);
    setMenuItemLabel('');
    setMenuItemUrl('');
    setMenuItemLinkType('custom');
    setMenuItemCategoryId('');
    setMenuItemProductId('');
    setMenuItemSystemPage('home');
    setIsMenuModalOpen(true);
  };

  const openEditMenuModal = (item: NavigationItem, depth: number, id: string) => {
    setEditingMenuItemId(id);
    setMenuItemParentId(null);
    setMenuItemLabel(item.label);
    setMenuItemUrl(item.url);

    if (item.url === '/') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('home');
    } else if (item.url === '/shop') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('shop');
    } else if (item.url === '/cart') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('cart');
    } else if (item.url === '/wishlist') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('wishlist');
    } else if (item.url.startsWith('/shop?category=')) {
      setMenuItemLinkType('category');
      const slug = item.url.replace('/shop?category=', '');
      const cat = categoriesList.find((c) => c.slug === slug);
      setMenuItemCategoryId(cat?.id || '');
    } else if (item.url.startsWith('/product/')) {
      setMenuItemLinkType('product');
      const slug = item.url.replace('/product/', '');
      const prod = productsList.find((p) => p.slug === slug);
      setMenuItemProductId(prod?.id || '');
    } else {
      setMenuItemLinkType('custom');
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = () => {
    if (!menuItemLabel.trim()) {
      toast.error('Menu Label is required');
      return;
    }

    let finalUrl = menuItemUrl.trim();
    if (menuItemLinkType === 'system') {
      if (menuItemSystemPage === 'home') finalUrl = '/';
      else if (menuItemSystemPage === 'shop') finalUrl = '/shop';
      else if (menuItemSystemPage === 'cart') finalUrl = '/cart';
      else if (menuItemSystemPage === 'wishlist') finalUrl = '/wishlist';
    } else if (menuItemLinkType === 'category') {
      const cat = categoriesList.find((c) => c.id === menuItemCategoryId);
      if (!cat) {
        toast.error('Please select a category');
        return;
      }
      finalUrl = `/shop?category=${cat.slug}`;
    } else if (menuItemLinkType === 'product') {
      const prod = productsList.find((p) => p.id === menuItemProductId);
      if (!prod) {
        toast.error('Please select a product');
        return;
      }
      finalUrl = `/product/${prod.slug}`;
    }

    if (!finalUrl) {
      toast.error('URL/Link is required');
      return;
    }

    const updatedMenu = deepCloneMenu(navigationMenu);

    if (editingMenuItemId) {
      const { node } = findNodeAndParent(updatedMenu, editingMenuItemId);
      if (node) {
        node.label = menuItemLabel.trim();
        node.url = finalUrl;
      }
    } else {
      const newItem: NavigationItem = {
        id: Math.random().toString(36).substr(2, 9),
        label: menuItemLabel.trim(),
        url: finalUrl,
        children: [],
      };
      if (menuItemParentId) {
        const { node } = findNodeAndParent(updatedMenu, menuItemParentId);
        if (node) {
          if (!node.children) node.children = [];
          node.children.push(newItem);
        }
      } else {
        updatedMenu.push(newItem);
      }
    }

    setNavigationMenu(updatedMenu);
    setIsMenuModalOpen(false);
    setEditingMenuItemId(null);
    setMenuItemParentId(null);
    toast.success('Menu item saved to local settings (click Save Settings to persist)');
  };

  return {
    navigationMenu,
    setNavigationMenu,
    categoriesList,
    setCategoriesList,
    productsList,
    setProductsList,
    editingMenuItemId,
    setEditingMenuItemId,
    menuItemParentId,
    setMenuItemParentId,
    isMenuModalOpen,
    setIsMenuModalOpen,
    menuItemLabel,
    setMenuItemLabel,
    menuItemUrl,
    setMenuItemUrl,
    menuItemLinkType,
    setMenuItemLinkType,
    menuItemCategoryId,
    setMenuItemCategoryId,
    menuItemProductId,
    setMenuItemProductId,
    menuItemSystemPage,
    setMenuItemSystemPage,
    moveMenuItemUp,
    moveMenuItemDown,
    indentMenuItem,
    outdentMenuItem,
    handleDeleteMenuItem,
    openAddMenuModal,
    openEditMenuModal,
    handleSaveMenuItem,
  };
}
