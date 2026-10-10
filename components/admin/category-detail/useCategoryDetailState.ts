'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import {
  addProductsToCategoryAction,
  removeProductsFromCategoryAction,
  updateCategorySortOrderAction,
} from '@/lib/services/products/actions';
import { getAllProductsAdmin } from '@/lib/services/products';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { arrayMove } from '@/lib/utils/arrayMove';
import { toast } from 'sonner';

export function useCategoryDetailState(category: Category, initialProducts: Product[]) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sortBy, setSortBy] = useState(category.active_sort_preference || 'manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingSortOrder, setSavingSortOrder] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [targetPosition, setTargetPosition] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allStoreProducts, setAllStoreProducts] = useState<Product[]>([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSelectedProductIds, setModalSelectedProductIds] = useState<string[]>([]);

  // Multi-select bulk move → shared reorder semantics (preserve selected order,
  // insert at a 1-based target). Same algorithm as useReorder.moveSelectedToPosition.
  const handleBulkMoveToPosition = (targetPos: number) => {
    if (selectedProductIds.length === 0) return;
    const idSet = new Set(selectedProductIds);
    const selectedItems = products.filter(p => idSet.has(p.id));
    const remainingItems = products.filter(p => !idSet.has(p.id));
    const targetIndex = Math.max(0, Math.min(targetPos - 1, remainingItems.length));
    const reordered = [...remainingItems];
    reordered.splice(targetIndex, 0, ...selectedItems);
    setProducts(reordered);
    setHasUnsavedChanges(true);
    setTargetPosition('');
  };

  // --- single-item reorder helpers (shared by table drag / chevrons / move modal) ---
  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= products.length) return;
    setProducts(arrayMove(products, idx, target));
    setHasUnsavedChanges(true);
  };

  const moveProductToPosition = (productId: string, position1Based: number) => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const target = Math.max(0, Math.min(position1Based - 1, products.length - 1));
    if (idx === target) return;
    setProducts(arrayMove(products, idx, target));
    setHasUnsavedChanges(true);
  };

  const reorderProductsByDrag = (fromId: string, toId: string) => {
    const from = products.findIndex(p => p.id === fromId);
    const to = products.findIndex(p => p.id === toId);
    if (from === -1 || to === -1 || from === to) return;
    setProducts(arrayMove(products, from, to));
    setHasUnsavedChanges(true);
  };

  const handleBulkRemoveProducts = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Remove Products',
      message: `Are you sure you want to remove ${selectedProductIds.length} products from this category?`,
      variant: 'danger',
      confirmText: 'Remove'
    });
    if (!confirmed) return;
    
    setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    setHasUnsavedChanges(true);
    toast.info('Selected products marked for removal. Click Save Settings to apply.', { duration: 4000 });
  };

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setLoadingAllProducts(true);
    try {
      const data = await getAllProductsAdmin();
      setAllStoreProducts(data);
    } catch (err) {
      toast.error('Failed to load store products');
    } finally {
      setLoadingAllProducts(false);
    }
  };

  const handleAddProduct = async (productId: string) => {
    const addedProduct = allStoreProducts.find(p => p.id === productId);
    if (addedProduct) {
      const updatedProduct = {
        ...addedProduct,
        productCategories: [
          ...(addedProduct.product_categories || []),
          { productId: productId, categoryId: category.id }
        ]
      };
      setProducts(prev => [updatedProduct, ...prev]);
      setHasUnsavedChanges(true);
      toast.info('Product marked to add. Click Save Settings to apply.', { duration: 3000 });
    }
  };

  const handleBulkAddProducts = async () => {
    if (modalSelectedProductIds.length === 0) return;
    
    const addedProducts = allStoreProducts.filter(p => modalSelectedProductIds.includes(p.id));
    const newProducts = addedProducts.map(p => ({
      ...p,
      productCategories: [
        ...(p.product_categories || []),
        { product_id: p.id, category_id: category.id }
      ]
    }));
    
    setProducts(prev => [...newProducts, ...prev]);
    setModalSelectedProductIds([]);
    setHasUnsavedChanges(true);
    toast.info(`${addedProducts.length} products marked to add. Click Save Settings to apply.`, { duration: 4000 });
  };

  const handleRemoveProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setHasUnsavedChanges(true);
    toast.info('Product marked for removal. Click Save Settings to apply.', { duration: 3000 });
  };

  const handleSaveSortOrder = async () => {
    setSavingSortOrder(true);
    const toastId = toast.loading('Saving changes...');
    try {
      const originalProductIds = new Set(initialProducts.map(p => p.id));
      const currentProductIds = new Set(products.map(p => p.id));
      
      const addedProductIds = products.filter(p => !originalProductIds.has(p.id)).map(p => p.id);
      const removedProductIds = initialProducts.filter(p => !currentProductIds.has(p.id)).map(p => p.id);

      if (addedProductIds.length > 0) {
        await addProductsToCategoryAction(addedProductIds, category.id);
      }
      
      if (removedProductIds.length > 0) {
        await removeProductsFromCategoryAction(removedProductIds, category.id);
      }

      await updateCategorySortOrderAction(
        category.id,
        sortBy === 'manual' ? products.map(p => p.id) : [],
        sortBy
      );
      
      setHasUnsavedChanges(false);
      toast.success('Settings and products saved successfully', { id: toastId });
      router.refresh();
    } catch (err) {
      console.error('[category-detail] handleSaveSortOrder failed:', err);
      toast.error('Failed to save settings', { id: toastId });
    } finally {
      setSavingSortOrder(false);
    }
  };

  return {
    products, setProducts,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    hasUnsavedChanges, setHasUnsavedChanges,
    savingSortOrder,
    expandedProducts, setExpandedProducts,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    previewImageUrl, setPreviewImageUrl,
    updatingIds, setUpdatingIds,
    selectedProductIds, setSelectedProductIds,
    targetPosition, setTargetPosition,
    isAddModalOpen, setIsAddModalOpen,
    allStoreProducts,
    loadingAllProducts,
    addingProductId,
    modalSearchQuery, setModalSearchQuery,
    modalSelectedProductIds, setModalSelectedProductIds,
    handleBulkMoveToPosition,
    moveProduct,
    moveProductToPosition,
    reorderProductsByDrag,
    handleBulkRemoveProducts,
    openAddModal,
    handleAddProduct,
    handleBulkAddProducts,
    handleRemoveProduct,
    handleSaveSortOrder
  };
}
