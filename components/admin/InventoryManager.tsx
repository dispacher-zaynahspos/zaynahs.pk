'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { 
  bulkUpdateInventoryAction,
  BulkInventoryUpdateItem,
  BulkInventoryVariantUpdateItem
} from '@/lib/services/products/actions';
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
import { InventorySaveBar } from './inventory-manager/InventorySaveBar';

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

  // Staged pending changes state (key = productId or variantId, value = new edited number or raw string)
  const [pendingProductStock, setPendingProductStock] = useState<Record<string, number | string>>({});
  const [pendingProductThreshold, setPendingProductThreshold] = useState<Record<string, number | string>>({});
  const [pendingVariantStock, setPendingVariantStock] = useState<Record<string, number | string>>({});
  const [pendingVariantThreshold, setPendingVariantThreshold] = useState<Record<string, number | string>>({});
  const [isSavingAll, setIsSavingAll] = useState(false);

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

  // Staging handlers for non-variant products
  const handlePendingProductStockChange = (productId: string, rawVal: number | string) => {
    const original = products.find(p => p.id === productId)?.stock ?? 0;
    if (String(rawVal) === String(original)) {
      setPendingProductStock(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setPendingProductStock(prev => ({ ...prev, [productId]: rawVal }));
    }
  };

  const handlePendingProductThresholdChange = (productId: string, rawVal: number | string) => {
    const prod = products.find(p => p.id === productId);
    const original = prod?.inventoryThreshold !== undefined && prod?.inventoryThreshold !== null ? prod.inventoryThreshold : 5;
    if (String(rawVal) === String(original)) {
      setPendingProductThreshold(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setPendingProductThreshold(prev => ({ ...prev, [productId]: rawVal }));
    }
  };

  // Staging handlers for variants
  const handlePendingVariantStockChange = (productId: string, variantId: string, rawVal: number | string) => {
    const prod = products.find(p => p.id === productId);
    const variant = prod?.variants?.find(v => v.id === variantId);
    const original = variant?.stock ?? 0;
    if (String(rawVal) === String(original)) {
      setPendingVariantStock(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } else {
      setPendingVariantStock(prev => ({ ...prev, [variantId]: rawVal }));
    }
  };

  const handlePendingVariantThresholdChange = (productId: string, variantId: string, rawVal: number | string) => {
    const prod = products.find(p => p.id === productId);
    const variant = prod?.variants?.find(v => v.id === variantId);
    const original = variant?.inventoryThreshold !== undefined && variant?.inventoryThreshold !== null ? variant.inventoryThreshold : 5;
    if (String(rawVal) === String(original)) {
      setPendingVariantThreshold(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } else {
      setPendingVariantThreshold(prev => ({ ...prev, [variantId]: rawVal }));
    }
  };

  // Bulk staging handlers for selected variants within a product
  const handleBulkStageVariantStock = (productId: string, variantIds: string[], newStock: number) => {
    const prod = products.find(p => p.id === productId);
    setPendingVariantStock(prev => {
      const next = { ...prev };
      for (const vId of variantIds) {
        const variant = prod?.variants?.find(v => v.id === vId);
        const original = variant?.stock ?? 0;
        if (newStock === original) {
          delete next[vId];
        } else {
          next[vId] = newStock;
        }
      }
      return next;
    });
    setSelectedVariantIds(prev => prev.filter(id => !variantIds.includes(id)));
    toast.info(`Updated stock for ${variantIds.length} variants (click Save All Changes to apply)`);
  };

  const handleBulkStageVariantThreshold = (productId: string, variantIds: string[], newThreshold: number) => {
    const prod = products.find(p => p.id === productId);
    setPendingVariantThreshold(prev => {
      const next = { ...prev };
      for (const vId of variantIds) {
        const variant = prod?.variants?.find(v => v.id === vId);
        const original = variant?.inventoryThreshold !== undefined && variant?.inventoryThreshold !== null ? variant.inventoryThreshold : 5;
        if (newThreshold === original) {
          delete next[vId];
        } else {
          next[vId] = newThreshold;
        }
      }
      return next;
    });
    setSelectedVariantIds(prev => prev.filter(id => !variantIds.includes(id)));
    toast.info(`Updated threshold for ${variantIds.length} variants (click Save All Changes to apply)`);
  };

  // Count total distinct items (products or variants) modified
  const pendingEditedItemIds = new Set<string>([
    ...Object.keys(pendingProductStock),
    ...Object.keys(pendingProductThreshold),
    ...Object.keys(pendingVariantStock),
    ...Object.keys(pendingVariantThreshold),
  ]);
  const totalPendingChanges = pendingEditedItemIds.size;
  const hasUnsavedChanges = totalPendingChanges > 0;

  // Discard all staged changes
  const handleDiscardAll = () => {
    setPendingProductStock({});
    setPendingProductThreshold({});
    setPendingVariantStock({});
    setPendingVariantThreshold({});
    toast.info('Discarded all unsaved inventory changes');
  };

  // Save all staged changes in 1 single network request
  const handleSaveAllChanges = async () => {
    if (!hasUnsavedChanges) return;
    setIsSavingAll(true);
    try {
      // 1. Build products payload
      const changedProdIds = new Set<string>([
        ...Object.keys(pendingProductStock),
        ...Object.keys(pendingProductThreshold),
      ]);
      const productsPayload: BulkInventoryUpdateItem[] = Array.from(changedProdIds).map(id => {
        const stockVal = pendingProductStock[id] !== undefined ? parseInt(String(pendingProductStock[id]), 10) : undefined;
        const threshVal = pendingProductThreshold[id] !== undefined ? parseInt(String(pendingProductThreshold[id]), 10) : undefined;
        return {
          id,
          stock: !isNaN(stockVal as number) ? stockVal : undefined,
          inventoryThreshold: !isNaN(threshVal as number) ? threshVal : undefined,
        };
      });

      // 2. Build variants payload
      const changedVarIds = new Set<string>([
        ...Object.keys(pendingVariantStock),
        ...Object.keys(pendingVariantThreshold),
      ]);
      const variantsPayload: BulkInventoryVariantUpdateItem[] = Array.from(changedVarIds).map(vId => {
        const parentProd = products.find(p => p.variants?.some(v => v.id === vId));
        const stockVal = pendingVariantStock[vId] !== undefined ? parseInt(String(pendingVariantStock[vId]), 10) : undefined;
        const threshVal = pendingVariantThreshold[vId] !== undefined ? parseInt(String(pendingVariantThreshold[vId]), 10) : undefined;
        return {
          id: vId,
          productId: parentProd?.id,
          stock: !isNaN(stockVal as number) ? stockVal : undefined,
          inventoryThreshold: !isNaN(threshVal as number) ? threshVal : undefined,
        };
      });

      await bulkUpdateInventoryAction({
        products: productsPayload,
        variants: variantsPayload,
      });

      // 3. Update local state
      setProducts(prevProducts => {
        return prevProducts.map(prod => {
          let updatedProd = { ...prod };

          if (pendingProductStock[prod.id] !== undefined) {
            const val = parseInt(String(pendingProductStock[prod.id]), 10);
            if (!isNaN(val)) updatedProd.stock = val;
          }
          if (pendingProductThreshold[prod.id] !== undefined) {
            const val = parseInt(String(pendingProductThreshold[prod.id]), 10);
            if (!isNaN(val)) updatedProd.inventoryThreshold = val;
          }

          if (prod.hasVariants && prod.variants) {
            let variantsChanged = false;
            const updatedVariants = prod.variants.map(v => {
              let updatedV = { ...v };
              if (pendingVariantStock[v.id] !== undefined) {
                const val = parseInt(String(pendingVariantStock[v.id]), 10);
                if (!isNaN(val)) {
                  updatedV.stock = val;
                  variantsChanged = true;
                }
              }
              if (pendingVariantThreshold[v.id] !== undefined) {
                const val = parseInt(String(pendingVariantThreshold[v.id]), 10);
                if (!isNaN(val)) {
                  updatedV.inventoryThreshold = val;
                  variantsChanged = true;
                }
              }
              return updatedV;
            });

            if (variantsChanged) {
              updatedProd.variants = updatedVariants;
              updatedProd.stock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
            }
          }

          return updatedProd;
        });
      });

      // 4. Reset pending states
      setPendingProductStock({});
      setPendingProductThreshold({});
      setPendingVariantStock({});
      setPendingVariantThreshold({});

      toast.success(`Saved all changes successfully (${totalPendingChanges} item(s) updated)`);
    } catch (err) {
      console.error('Failed to save bulk inventory:', err);
      toast.error('Failed to save inventory changes. Please try again.');
    } finally {
      setIsSavingAll(false);
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
        const hasLowStockVariant = product.variants?.some(v => {
          const pVal = pendingVariantStock[v.id];
          const stock = pVal !== undefined ? (parseInt(String(pVal), 10) || 0) : v.stock;
          const pThresh = pendingVariantThreshold[v.id];
          const threshold = pThresh !== undefined ? (parseInt(String(pThresh), 10) || 0) : (v.inventoryThreshold ?? 5);
          return stock <= threshold;
        });
        if (!hasLowStockVariant) return false;
      } else {
        const pVal = pendingProductStock[product.id];
        const stock = pVal !== undefined ? (parseInt(String(pVal), 10) || 0) : product.stock;
        const pThresh = pendingProductThreshold[product.id];
        const threshold = pThresh !== undefined ? (parseInt(String(pThresh), 10) || 0) : (product.inventoryThreshold ?? 5);
        if (stock > threshold) return false;
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
    <div className="space-y-6 relative pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage stock quantities and alert thresholds with 1-time bulk saving</p>
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
            pendingProductStock={pendingProductStock}
            pendingProductThreshold={pendingProductThreshold}
            pendingVariantStock={pendingVariantStock}
            pendingVariantThreshold={pendingVariantThreshold}
            onPendingProductStockChange={handlePendingProductStockChange}
            onPendingProductThresholdChange={handlePendingProductThresholdChange}
            onPendingVariantStockChange={handlePendingVariantStockChange}
            onPendingVariantThresholdChange={handlePendingVariantThresholdChange}
            onBulkStageVariantStock={handleBulkStageVariantStock}
            onBulkStageVariantThreshold={handleBulkStageVariantThreshold}
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
            pendingProductStock={pendingProductStock}
            pendingProductThreshold={pendingProductThreshold}
            pendingVariantStock={pendingVariantStock}
            pendingVariantThreshold={pendingVariantThreshold}
            onPendingProductStockChange={handlePendingProductStockChange}
            onPendingProductThresholdChange={handlePendingProductThresholdChange}
            onPendingVariantStockChange={handlePendingVariantStockChange}
            onPendingVariantThresholdChange={handlePendingVariantThresholdChange}
            onBulkStageVariantStock={handleBulkStageVariantStock}
            onBulkStageVariantThreshold={handleBulkStageVariantThreshold}
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

      {/* Floating 1-Time Bulk Save Bar */}
      <InventorySaveBar
        hasUnsavedChanges={hasUnsavedChanges}
        pendingChangesCount={totalPendingChanges}
        isSaving={isSavingAll}
        onSave={handleSaveAllChanges}
        onDiscard={handleDiscardAll}
      />
      
      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
