'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { updateProductFieldsAction as updateProductFields, updateProductVariantFieldsAction as updateProductVariantFields } from '@/lib/services/products/actions';
import { toast } from 'sonner';
import { 
  SlidersHorizontal,
  PackageOpen
} from '@/components/common/Icons';
import PaginationFooter from './PaginationFooter';
import { saveProductNavContext } from '@/lib/hooks/useProductNav';
import EmptyState from '@/components/common/EmptyState';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';

import { InventoryTable } from './inventory-manager/InventoryTable';
import { InventoryMobileCards } from './inventory-manager/InventoryMobileCards';

interface InventoryManagerProps {
  products: Product[];
  categories: Category[];
}

export default function InventoryManager({ products: initialProducts, categories }: InventoryManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  /** Save inventory nav context then open product edit page */
  const handleEditProduct = (productId: string) => {
    saveProductNavContext({
      ids: filteredProducts.map(p => p.id),
      source: 'Inventory',
      sourceUrl: '/admin/inventory',
    });
    router.push(`/admin/products/${productId}`);
  };

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Inline updater for non-variant products
  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    const idKey = `stock-${productId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductFields(productId, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      toast.success('Stock updated successfully');
    } catch (err) {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  const handleUpdateProductThreshold = async (productId: string, newThreshold: number) => {
    const idKey = `threshold-${productId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductFields(productId, { inventoryThreshold: newThreshold });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, inventoryThreshold: newThreshold } : p));
      toast.success('Threshold updated successfully');
    } catch (err) {
      toast.error('Failed to update threshold');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  // Inline updater for variants
  const handleUpdateVariantStock = async (productId: string, variantId: string, newStock: number) => {
    const idKey = `stock-${variantId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductVariantFields(variantId, { stock: newStock });
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v);
        const computedStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...p,
          variants: updatedVariants,
          stock: computedStock
        };
      }));
      toast.success('Variant stock updated successfully');
    } catch (err) {
      toast.error('Failed to update variant stock');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  const handleUpdateVariantThreshold = async (productId: string, variantId: string, newThreshold: number) => {
    const idKey = `threshold-${variantId}`;
    setUpdatingIds(prev => ({ ...prev, [idKey]: true }));
    try {
      await updateProductVariantFields(variantId, { inventoryThreshold: newThreshold });
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map(v => v.id === variantId ? { ...v, inventoryThreshold: newThreshold } : v);
        return {
          ...p,
          variants: updatedVariants
        };
      }));
      toast.success('Variant threshold updated successfully');
    } catch (err) {
      toast.error('Failed to update variant threshold');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [idKey]: false }));
    }
  };

  // Bulk updater for variants
  const handleBulkUpdateVariantStock = async (productId: string, variantIds: string[], newStock: number) => {
    const toastId = toast.loading(`Updating stock for ${variantIds.length} variants...`);
    try {
      await Promise.all(variantIds.map(id => updateProductVariantFields(id, { stock: newStock })));
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map(v => variantIds.includes(v.id) ? { ...v, stock: newStock } : v);
        const computedStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...p,
          variants: updatedVariants,
          stock: computedStock
        };
      }));
      setSelectedVariantIds(prev => prev.filter(id => !variantIds.includes(id)));
      toast.success('Selected variant stocks updated successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to update variant stock', { id: toastId });
    }
  };

  const handleBulkUpdateVariantThreshold = async (productId: string, variantIds: string[], newThreshold: number) => {
    const toastId = toast.loading(`Updating thresholds for ${variantIds.length} variants...`);
    try {
      await Promise.all(variantIds.map(id => updateProductVariantFields(id, { inventoryThreshold: newThreshold })));
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map(v => variantIds.includes(v.id) ? { ...v, inventoryThreshold: newThreshold } : v);
        return {
          ...p,
          variants: updatedVariants
        };
      }));
      setSelectedVariantIds(prev => prev.filter(id => !variantIds.includes(id)));
      toast.success('Selected variant thresholds updated successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to update variant thresholds', { id: toastId });
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(q);
    const skuMatch = product.sku?.toLowerCase().includes(q) || false;
    const variantMatch = product.variants?.some(v => 
      (v.sku && v.sku.toLowerCase().includes(q)) ||
      (v.color && v.color.toLowerCase().includes(q)) ||
      (v.size && v.size.toLowerCase().includes(q)) ||
      (v.material && v.material.toLowerCase().includes(q)) ||
      (v.customValue && v.customValue.toLowerCase().includes(q))
    ) || false;
    const matchesSearch = nameMatch || skuMatch || variantMatch;

    if (!matchesSearch) return false;

    if (selectedCategory !== 'all') {
      const mainCategoryMatch = product.categoryId === selectedCategory;
      const multiCategoryMatch = product.productCategories?.some(pc => pc.categoryId === selectedCategory) || false;
      if (!mainCategoryMatch && !multiCategoryMatch) return false;
    }

    if (showLowStockOnly) {
      if (product.hasVariants) {
        const hasLowStockVariant = product.variants.some(v => {
          const threshold = v.inventoryThreshold !== undefined && v.inventoryThreshold !== null ? v.inventoryThreshold : 5;
          return v.stock <= threshold;
        });
        if (!hasLowStockVariant) return false;
      } else {
        const threshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null ? product.inventoryThreshold : 5;
        if (product.stock > threshold) return false;
      }
    }

    return true;
  });

  const totalFiltered = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage stock quantities and alert thresholds inline</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-gray-900 dark:text-white transition-colors">
        <div className="w-full sm:max-w-xs">
          <AdminSearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search products, SKUs..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] px-3 py-2 text-sm focus:outline-none focus:bg-white text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat.slug !== 'shop').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1d1d36] transition-all select-none">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => { setShowLowStockOnly(e.target.checked); setCurrentPage(1); }}
              className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Show Low Stock Only</span>
          </label>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-8 w-8 text-gray-400" />}
          title="No Inventory Records Found"
          description="Try resetting your search query or category filters."
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <InventoryTable
            paginatedProducts={paginatedProducts}
            expandedProducts={expandedProducts}
            toggleExpand={toggleExpand}
            selectedVariantIds={selectedVariantIds}
            setSelectedVariantIds={setSelectedVariantIds}
            updatingIds={updatingIds}
            handleUpdateProductStock={handleUpdateProductStock}
            handleUpdateProductThreshold={handleUpdateProductThreshold}
            handleUpdateVariantStock={handleUpdateVariantStock}
            handleUpdateVariantThreshold={handleUpdateVariantThreshold}
            handleBulkUpdateVariantStock={handleBulkUpdateVariantStock}
            handleBulkUpdateVariantThreshold={handleBulkUpdateVariantThreshold}
            handleEditProduct={handleEditProduct}
            setPreviewImageUrl={setPreviewImageUrl}
          />

          {/* Mobile Card View */}
          <InventoryMobileCards
            paginatedProducts={paginatedProducts}
            expandedProducts={expandedProducts}
            toggleExpand={toggleExpand}
            selectedVariantIds={selectedVariantIds}
            setSelectedVariantIds={setSelectedVariantIds}
            updatingIds={updatingIds}
            handleUpdateProductStock={handleUpdateProductStock}
            handleUpdateProductThreshold={handleUpdateProductThreshold}
            handleUpdateVariantStock={handleUpdateVariantStock}
            handleUpdateVariantThreshold={handleUpdateVariantThreshold}
            handleBulkUpdateVariantStock={handleBulkUpdateVariantStock}
            handleBulkUpdateVariantThreshold={handleBulkUpdateVariantThreshold}
            setPreviewImageUrl={setPreviewImageUrl}
          />

          <PaginationFooter
            totalItems={totalFiltered}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
      
      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
