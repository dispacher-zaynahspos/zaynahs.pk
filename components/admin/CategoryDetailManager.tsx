'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, ProductVariant } from '@/lib/types';
import { updateProductFields, updateProductVariantFields } from '@/lib/services/products';
import { toast } from 'sonner';
import { Search } from '@/components/common/Icons';
import PaginationFooter from './PaginationFooter';
import { saveProductNavContext } from '@/lib/hooks/useProductNav';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import {
  CategoryDetailHeader,
  CategoryAddProductsModal,
  CategoryProductsTable
} from './category-detail';
import { CategoryBulkActionFooter } from './category-detail/CategoryBulkActionFooter';
import { useCategoryDetailState } from './category-detail/useCategoryDetailState';

interface CategoryDetailManagerProps {
  category: Category;
  initialProducts: Product[];
}

export default function CategoryDetailManager({ category, initialProducts }: CategoryDetailManagerProps) {
  const router = useRouter();
  const state = useCategoryDetailState(category, initialProducts);
  const {
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
    handleBulkRemoveProducts,
    openAddModal,
    handleAddProduct,
    handleBulkAddProducts,
    handleRemoveProduct,
    handleSaveSortOrder
  } = state;

  const handleEditProduct = (productId: string, allFiltered: Product[]) => {
    saveProductNavContext({
      ids: allFiltered.map(p => p.id),
      source: category.name,
      sourceUrl: `/admin/categories/${category.id}`,
    });
    router.push(`/admin/products/${productId}`);
  };

  const assignedProductIds = new Set(products.map(p => p.id));
  const availableProducts = allStoreProducts.filter(p => !assignedProductIds.has(p.id));

  const filteredModalProducts = availableProducts.filter(p => {
    const q = modalSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.variants && p.variants.some(v => 
        (v.sku && v.sku.toLowerCase().includes(q)) ||
        (v.color && v.color.toLowerCase().includes(q)) ||
        (v.size && v.size.toLowerCase().includes(q)) ||
        (v.material && v.material.toLowerCase().includes(q)) ||
        (v.customValue && v.customValue.toLowerCase().includes(q))
      ))
    );
  });

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleUpdateProduct = async (productId: string, fields: Partial<Product>) => {
    const fieldName = Object.keys(fields)[0];
    const idKey = `${fieldName}-${productId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductFields(productId, fields);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...fields } : p));
      toast.success('Product updated successfully');
    } catch (err) {
      toast.error('Failed to update product');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  const handleUpdateVariant = async (productId: string, variantId: string, fields: Partial<ProductVariant>) => {
    const fieldName = Object.keys(fields)[0];
    const idKey = `${fieldName}-${variantId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductVariantFields(variantId, fields);
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map(v => v.id === variantId ? { ...v, ...fields } : v);
        const computedStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...p,
          variants: updatedVariants,
          stock: p.hasVariants ? computedStock : p.stock
        };
      }));
      toast.success('Variant updated successfully');
    } catch (err) {
      toast.error('Failed to update variant');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  const filteredProducts = products
    .filter(product => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      const nameMatch = product.name.toLowerCase().includes(q);
      const skuMatch = product.sku?.toLowerCase().includes(q) || false;
      const variantMatch = product.variants && product.variants.some(v => 
        (v.sku && v.sku.toLowerCase().includes(q)) ||
        (v.color && v.color.toLowerCase().includes(q)) ||
        (v.size && v.size.toLowerCase().includes(q)) ||
        (v.material && v.material.toLowerCase().includes(q)) ||
        (v.customValue && v.customValue.toLowerCase().includes(q))
      );
      return nameMatch || skuMatch || variantMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'manual') return 0;
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        case 'alpha_asc':
          return a.name.localeCompare(b.name);
        case 'alpha_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const totalFiltered = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', paginatedProducts[idx].id);
    setDraggingId(paginatedProducts[idx].id);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const threshold = 120;
    const speed = 15;
    const cursorY = e.clientY;
    const viewportH = window.innerHeight;
    if (cursorY > viewportH - threshold) {
      window.scrollBy({ top: speed, behavior: 'auto' });
    } else if (cursorY < threshold) {
      window.scrollBy({ top: -speed, behavior: 'auto' });
    }

    if (!draggingId) return;
    const tgtId = paginatedProducts[idx].id;
    if (draggingId === tgtId) return;

    const srcIdx = products.findIndex(p => p.id === draggingId);
    const tgtIdx = products.findIndex(p => p.id === tgtId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const reordered = [...products];
    const [dragged] = reordered.splice(srcIdx, 1);
    const adjustedTgt = tgtIdx > srcIdx ? tgtIdx - 1 : tgtIdx;
    reordered.splice(adjustedTgt, 0, dragged);
    setProducts(reordered);
    setHasUnsavedChanges(true);
    setDraggingId(tgtId);
  };

  const handleDrop = () => { setDraggingId(null); };
  const handleDragEnd = () => { setDraggingId(null); };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;
    const copy = [...products];
    const [removed] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, removed);
    setProducts(copy);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      <CategoryDetailHeader
        category={category}
        totalProducts={products.length}
        hasUnsavedChanges={hasUnsavedChanges}
        savingSortOrder={savingSortOrder}
        onSaveSortOrder={handleSaveSortOrder}
        onOpenAddModal={openAddModal}
      />

      <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-gray-900 dark:text-white transition-colors">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] text-sm focus:outline-none focus:border-[#1a1a2e] dark:focus:border-gray-600 focus:bg-white transition-all text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setHasUnsavedChanges(true);
            setCurrentPage(1);
          }}
          className="flex items-center gap-2 max-w-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:border-[#1a1a2e] dark:focus:border-gray-600 focus:outline-none"
        >
          <option value="manual">Manual Order</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="alpha_asc">Alphabetically: A-Z</option>
          <option value="alpha_desc">Alphabetically: Z-A</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden text-gray-900 dark:text-white transition-colors">
        <CategoryProductsTable
          products={products}
          paginatedProducts={paginatedProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          sortBy={sortBy}
          draggingId={draggingId}
          expandedProducts={expandedProducts}
          toggleExpand={toggleExpand}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
          moveProduct={moveProduct}
          handleEditProduct={handleEditProduct}
          handleRemoveProduct={handleRemoveProduct}
          handleUpdateProduct={handleUpdateProduct}
          handleUpdateVariant={handleUpdateVariant}
          updatingIds={updatingIds}
          setPreviewImageUrl={setPreviewImageUrl}
        />
        <PaginationFooter
          currentPage={currentPage}
          totalItems={totalFiltered}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      <CategoryAddProductsModal
        isOpen={isAddModalOpen}
        category={category}
        loadingAllProducts={loadingAllProducts}
        filteredModalProducts={filteredModalProducts}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        modalSelectedProductIds={modalSelectedProductIds}
        setModalSelectedProductIds={setModalSelectedProductIds}
        addingProductId={addingProductId}
        onAddProduct={handleAddProduct}
        onBulkAddProducts={handleBulkAddProducts}
        onClose={() => setIsAddModalOpen(false)}
      />

      <CategoryBulkActionFooter
        hasUnsavedChanges={hasUnsavedChanges}
        selectedProductIds={selectedProductIds}
        totalProductsCount={products.length}
        targetPosition={targetPosition}
        setTargetPosition={setTargetPosition}
        savingSortOrder={savingSortOrder}
        handleBulkMoveToPosition={handleBulkMoveToPosition}
        handleBulkRemoveProducts={handleBulkRemoveProducts}
        setSelectedProductIds={setSelectedProductIds}
        handleSaveSortOrder={handleSaveSortOrder}
      />
      
      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
