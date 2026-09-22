'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, StoreSettings } from '@/lib/types';
import { deleteProduct, updateProductFields } from '@/lib/services/products';
import { triggerMetaSync } from '@/lib/services/metaSyncAction';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import ImportExportModal from '@/components/admin/ImportExportModal';
import PaginationFooter from './PaginationFooter';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import { saveProductNavContext } from '@/lib/hooks/useProductNav';
import { 
  ProductListToolbar, 
  ProductListBulkActions, 
  ProductListTable 
} from './product-list';

interface ProductListProps {
  initialProducts: Product[];
  settings: StoreSettings;
}

export default function ProductList({ initialProducts, settings }: ProductListProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingFailed, setSyncingFailed] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('created-desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  /** Save nav context then navigate to edit page */
  const handleEditProduct = (productId: string, allFiltered: Product[]) => {
    saveProductNavContext({
      ids: allFiltered.map(p => p.id),
      source: 'Products',
      sourceUrl: '/admin/products',
    });
    router.push(`/admin/products/${productId}`);
  };

  const categoriesMap = new Map<string, string>();
  products.forEach(p => {
    if (p.productCategories) {
      p.productCategories.forEach(pc => {
        if (pc.category && pc.categoryId) categoriesMap.set(pc.categoryId, pc.category.name);
      });
    }
    if (p.category && p.categoryId) {
      categoriesMap.set(p.categoryId, p.category.name);
    }
  });
  const availableCategories = Array.from(categoriesMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleBulkFeatured = async (featuredValue: boolean) => {
    if (selectedProductIds.length === 0) return;
    const toastId = toast.loading(`Updating ${selectedProductIds.length} products...`);
    try {
      await Promise.all(selectedProductIds.map(id => updateProductFields(id, { isFeatured: featuredValue })));
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, isFeatured: featuredValue } : p));
      toast.success(`Successfully updated ${selectedProductIds.length} products`, { id: toastId });
      setSelectedProductIds([]);
    } catch {
      toast.error('Failed to update products featured status', { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Move to Trash',
      message: `Are you sure you want to move ${selectedProductIds.length} products to Trash?`,
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;
    const toastId = toast.loading(`Deleting ${selectedProductIds.length} products...`);
    try {
      await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      toast.success(`Moved ${selectedProductIds.length} products to Trash`, { id: toastId });
      setSelectedProductIds([]);
    } catch {
      toast.error('Failed to move products to Trash', { id: toastId });
    }
  };

  const handleBulkMetaSync = async () => {
    if (selectedProductIds.length === 0) return;
    const toastId = toast.loading(`Syncing ${selectedProductIds.length} products to Meta catalog...`);
    try {
      const results = await Promise.all(selectedProductIds.map(async (id) => {
        try {
          const res = await triggerMetaSync(id);
          return { id, success: res.success, error: res.error };
        } catch (e: any) {
          return { id, success: false, error: e.message || 'Unknown error' };
        }
      }));
      
      const failed = results.filter(r => !r.success);
      
      setProducts(prev => prev.map(p => {
        const result = results.find(r => r.id === p.id);
        if (result) {
          return {
            ...p,
            meta_sync_status: result.success ? 'synced' as const : 'error' as const,
            meta_sync_error: result.success ? null : result.error
          };
        }
        return p;
      }));

      if (failed.length === 0) {
        toast.success('All selected products synced successfully', { id: toastId });
      } else {
        toast.warning(`Synced with ${failed.length} failure(s)`, { id: toastId });
      }
      setSelectedProductIds([]);
    } catch {
      toast.error('Failed to execute bulk sync', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this product to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product moved to Trash successfully');
    } catch {
      toast.error('Failed to move product to Trash');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const nextFeatured = !product.isFeatured;
      await updateProductFields(product.id, { isFeatured: nextFeatured });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: nextFeatured } : p));
      toast.success(`Product ${nextFeatured ? 'marked as featured' : 'removed from featured'} successfully`);
    } catch (err) {
      console.error('[ProductList] handleToggleFeatured failed:', err);
      toast.error('Failed to update product featured status');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const nextActive = !product.isActive;
      await updateProductFields(product.id, { isActive: nextActive });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: nextActive } : p));
      toast.success(`Product ${nextActive ? 'visible on store' : 'hidden from store'} successfully`);
    } catch (err) {
      console.error('[ProductList] handleToggleActive failed:', err);
      toast.error('Failed to update product visibility');
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await fetch('/api/meta-sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synced ${data.totalSynced} products to Meta catalog`);
        window.location.reload();
      } else {
        toast.error(`Sync failed: ${data.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch {
      toast.error('Bulk sync request failed');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncFailed = async () => {
    setSyncingFailed(true);
    try {
      const res = await fetch('/api/meta-sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'failed' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synced ${data.totalSynced} failed/pending products to Meta`);
        window.location.reload();
      } else {
        toast.error(`Sync failed: ${data.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch {
      toast.error('Retry sync request failed');
    } finally {
      setSyncingFailed(false);
    }
  };

  const handleSingleSync = async (productId: string) => {
    setSyncingProductId(productId);
    try {
      const res = await triggerMetaSync(productId);
      if (res.success) {
        toast.success('Product synced to Meta catalog successfully');
        setProducts(prev => prev.map(p => p.id === productId ? { 
          ...p, 
          meta_sync_status: 'synced', 
          meta_sync_error: null
        } : p));
      } else {
        toast.error(`Failed to sync: ${res.error}`);
        setProducts(prev => prev.map(p => p.id === productId ? { 
          ...p, 
          meta_sync_status: 'error', 
          meta_sync_error: res.error 
        } : p));
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncingProductId(null);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
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
    })
    .filter(p => {
      if (selectedCategory === 'all') return true;
      if (p.productCategories && p.productCategories.length > 0) {
        return p.productCategories.some(pc => pc.categoryId === selectedCategory);
      }
      return p.categoryId === selectedCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'manual': return 0;
        case 'created-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-desc': return (b.price || 0) - (a.price || 0);
        case 'price-asc': return (a.price || 0) - (b.price || 0);
        case 'created-desc':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalFiltered = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions header */}
      <ProductListToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableCategories={availableCategories}
        settings={settings}
        syncingAll={syncingAll}
        syncingFailed={syncingFailed}
        onSyncAll={handleSyncAll}
        onSyncFailed={handleSyncFailed}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        setCurrentPage={setCurrentPage}
      />

      {/* Bulk action toolbar */}
      <ProductListBulkActions
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        settings={settings}
        onBulkFeatured={handleBulkFeatured}
        onBulkMetaSync={handleBulkMetaSync}
        onBulkDelete={handleBulkDelete}
      />

      {/* Table listing */}
      <ProductListTable
        filteredProducts={filteredProducts}
        paginatedProducts={paginatedProducts}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        settings={settings}
        syncingProductId={syncingProductId}
        setPreviewImageUrl={setPreviewImageUrl}
        handleToggleActive={handleToggleActive}
        handleToggleFeatured={handleToggleFeatured}
        handleSingleSync={handleSingleSync}
        handleEditProduct={handleEditProduct}
        handleDelete={handleDelete}
      />

      <PaginationFooter
        totalItems={totalFiltered}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        products={products}
        onImportComplete={() => {
          window.location.reload();
        }}
      />
      
      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
