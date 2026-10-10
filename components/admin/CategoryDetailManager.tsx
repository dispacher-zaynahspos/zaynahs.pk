'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, ProductVariant } from '@/lib/types';
import { updateProductFieldsAction as updateProductFields, updateProductVariantFieldsAction as updateProductVariantFields } from '@/lib/services/products/actions';
import { updateCategorySafe } from '@/lib/services/categories';
import { toast } from 'sonner';
import { Search } from '@/components/common/Icons';
import { SORT_OPTIONS } from '@/lib/sorting/sortOptions';
import PaginationFooter from './PaginationFooter';
import { saveProductNavContext } from '@/lib/hooks/useProductNav';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import MediaSelectorModal from './MediaSelectorModal';
import {
  CategoryDetailHeader,
  CategoryAddProductsModal,
  CategoryProductsTable
} from './category-detail';
import { CategoryBulkActionFooter } from './category-detail/CategoryBulkActionFooter';
import { useCategoryDetailState } from './category-detail/useCategoryDetailState';
import CategoryFormModal from './category-manager/CategoryFormModal';

interface CategoryDetailManagerProps {
  category: Category;
  initialProducts: Product[];
}

export default function CategoryDetailManager({ category, initialProducts }: CategoryDetailManagerProps) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState<Category>(category);

  // Category Edit Modal State
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [catSlug, setCatSlug] = useState(category.slug);
  const [catDesc, setCatDesc] = useState(category.description || '');
  const [catImage, setCatImage] = useState(category.image_url || '');
  const [catSortOrder, setCatSortOrder] = useState(category.sort_order != null ? category.sort_order.toString() : '0');
  const [catActive, setCatActive] = useState(category.active);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
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
    moveProduct,
    moveProductToPosition,
    reorderProductsByDrag,
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
        (v.custom_value && v.custom_value.toLowerCase().includes(q))
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
          stock: p.has_variants ? computedStock : p.stock
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
        (v.custom_value && v.custom_value.toLowerCase().includes(q))
      );
      return nameMatch || skuMatch || variantMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'manual') return 0;
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

  const handleOpenEditCategory = () => {
    setCatName(currentCategory.name);
    setCatSlug(currentCategory.slug);
    setCatDesc(currentCategory.description || '');
    setCatImage(currentCategory.image_url || '');
    setCatSortOrder(currentCategory.sort_order != null ? currentCategory.sort_order.toString() : '0');
    setCatActive(currentCategory.active);
    setIsEditCategoryModalOpen(true);
  };

  const handleAICopywrite = async () => {
    if (!catName.trim()) {
      toast.error('Please enter a Category Name first');
      return;
    }
    try {
      setIsAiGenerating(true);
      toast.info('AI is drafting professional category copy...');
      const response = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'category',
          entity_id: currentCategory.id,
          entity_data: {
            name: catName.trim(),
            description: catDesc.trim() || undefined,
            slug: catSlug.trim(),
          },
        }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'AI generation failed');
      }
      if (resData.skipped) {
        toast.warning(resData.message || 'AI keys not configured');
      } else if (resData.data?.long_description) {
        setCatDesc(resData.data.long_description);
        toast.success('AI description generated successfully!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation failed';
      toast.error(msg);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmitEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Category Name is required');
      return;
    }
    if (!catSlug.trim()) {
      toast.error('Category Slug is required');
      return;
    }

    setIsSubmittingCat(true);
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim(),
        description: catDesc.trim() ? catDesc.trim() : null,
        image_url: catImage.trim() ? catImage.trim() : null,
        sort_order: parseInt(catSortOrder, 10) || 0,
        active: catActive,
      };
      const res = await updateCategorySafe(currentCategory.id, payload);
      if (!res.success) {
        throw new Error(res.error);
      }
      setCurrentCategory(res.data);
      setIsEditCategoryModalOpen(false);
      toast.success('Category updated successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update category';
      toast.error(msg);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  return (
    <div className={`space-y-6 ${hasUnsavedChanges || selectedProductIds.length > 0 ? 'pb-48 sm:pb-36' : 'pb-24 sm:pb-16'}`}>
      <CategoryDetailHeader
        category={currentCategory}
        totalProducts={products.length}
        hasUnsavedChanges={hasUnsavedChanges}
        savingSortOrder={savingSortOrder}
        onSaveSortOrder={handleSaveSortOrder}
        onOpenAddModal={openAddModal}
        onOpenEditCategory={handleOpenEditCategory}
      />

      <div className="bg-white dark:bg-[#16162a] p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between text-gray-900 dark:text-white transition-colors">
        <div className="relative w-full sm:max-w-md">
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
          className="w-full sm:w-auto min-w-[180px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-[#1a1a2e] dark:focus:border-gray-600 focus:outline-none cursor-pointer"
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
          expandedProducts={expandedProducts}
          toggleExpand={toggleExpand}
          moveToPosition={moveProductToPosition}
          moveProduct={moveProduct}
          reorderByDrag={reorderProductsByDrag}
          handleEditProduct={handleEditProduct}
          handleRemoveProduct={handleRemoveProduct}
          handleUpdateProduct={handleUpdateProduct}
          handleUpdateVariant={handleUpdateVariant}
          updatingIds={updatingIds}
          setPreviewImageUrl={setPreviewImageUrl}
          rankOffset={(currentPage - 1) * pageSize}
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
        category={currentCategory}
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

      <CategoryFormModal
        isOpen={isEditCategoryModalOpen}
        editId={currentCategory.id}
        name={catName}
        setName={setCatName}
        slug={catSlug}
        setSlug={setCatSlug}
        description={catDesc}
        setDescription={setCatDesc}
        imageUrl={catImage}
        setImageUrl={setCatImage}
        sortOrder={catSortOrder}
        setSortOrder={setCatSortOrder}
        active={catActive}
        setActive={setCatActive}
        aiConfigured={true}
        isAiGenerating={isAiGenerating}
        isSubmitting={isSubmittingCat}
        onClose={() => setIsEditCategoryModalOpen(false)}
        onSubmit={handleSubmitEditCategory}
        onAICopywrite={handleAICopywrite}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
      />

      {isMediaModalOpen && (
        <MediaSelectorModal
          isOpen={true}
          onSelect={(urls) => {
            if (urls[0]) setCatImage(urls[0]);
            setIsMediaModalOpen(false);
          }}
          onClose={() => setIsMediaModalOpen(false)}
        />
      )}

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
