'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Zap, 
  ChevronRight, 
  Loader2 
} from '@/components/common/Icons';
import { toast } from 'sonner';
import { SEOPreviewModal } from '@/components/admin/SEOPreviewModal';
import { EditSEOModal } from '@/components/admin/EditSEOModal';
import { SEOEntityItem, SEODirectoryTable } from '../components';

export default function ProductsSEOClient() {
  const [products, setProducts] = useState<SEOEntityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'optimized' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [bulkOptimizing, setBulkOptimizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [storeSettings, setStoreSettings] = useState<{ store_url?: string; store_name?: string } | null>(null);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<SEOEntityItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const [aiRes, settingsRes] = await Promise.all([
          supabase
            .from('ai_settings')
            .select('ai_enabled')
            .eq('id', '00000000-0000-4000-8000-000000000002')
            .single(),
          supabase
            .from('store_settings')
            .select('store_url, store_name')
            .eq('id', '00000000-0000-4000-8000-000000000001')
            .single()
        ]);
        setAiEnabled(aiRes.data?.ai_enabled ?? false);
        setStoreSettings(settingsRes.data || null);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filter, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let productIdsFilter: string[] | null = null;
      let isPendingFilter = false;

      if (filter === 'optimized') {
        const { data: metas } = await supabase
          .from('seo_meta')
          .select('entity_id')
          .eq('entity_type', 'product')
          .eq('is_optimized', true);
        
        productIdsFilter = (metas || []).map(m => m.entity_id);
        if (productIdsFilter.length === 0) {
          setProducts([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }
      } else if (filter === 'pending') {
        const { data: metas } = await supabase
          .from('seo_meta')
          .select('entity_id')
          .eq('entity_type', 'product')
          .eq('is_optimized', true);
        
        productIdsFilter = (metas || []).map(m => m.entity_id);
        isPendingFilter = true;
      }

      let query = supabase
        .from('products')
        .select('id, name, slug', { count: 'exact' });

      if (search.trim()) {
        query = query.ilike('name', `%${search}%`);
      }

      if (productIdsFilter) {
        if (isPendingFilter) {
          if (productIdsFilter.length > 0) {
            query = query.not('id', 'in', `(${productIdsFilter.join(',')})`);
          }
        } else {
          query = query.in('id', productIdsFilter);
        }
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: productsData, count, error } = await query
        .order('name', { ascending: true })
        .range(from, to);

      if (error) throw error;

      const items = productsData || [];
      if (items.length === 0) {
        setProducts([]);
        setTotalCount(count || 0);
        return;
      }

      const itemIds = items.map(p => p.id);
      const { data: metasData, error: metasError } = await supabase
        .from('seo_meta')
        .select('*')
        .eq('entity_type', 'product')
        .in('entity_id', itemIds);

      if (metasError) throw metasError;

      const metasMap = new Map(metasData?.map(m => [m.entity_id, m]) || []);

      const formattedData = items.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        seo_meta: metasMap.get(p.id) || null
      }));

      setProducts(formattedData);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('[Products SEO] Fetch failed:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (id: string) => {
    try {
      setOptimizingId(id);
      const response = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: 'product', entity_id: id })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.error || 'Failed to optimize product');

      if (resData.skipped) {
        toast.warning(resData.message || 'AI keys not configured');
      } else {
        toast.success('Product SEO copywriting generated!');
        fetchProducts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Optimization failed');
    } finally {
      setOptimizingId(null);
    }
  };

  const handleBulkOptimize = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkOptimizing(true);
      const items = selectedIds.map(id => ({ entity_type: 'product', entity_id: id }));

      const response = await fetch('/api/seo/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Bulk process failed');

      toast.success(`Bulk optimize finished! Success: ${resData.success}, Failed: ${resData.failed}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Bulk optimize failed');
    } finally {
      setBulkOptimizing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-550 dark:text-gray-400">
        <Link href="/admin/seo" className="hover:text-blue-650">SEO Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-950 dark:text-white">Products List</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Products SEO Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review, edit and write SEO copy content for your storefront catalog.</p>
        </div>
        
        {aiEnabled && selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleBulkOptimize}
            disabled={bulkOptimizing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-sm transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            {bulkOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Bulk...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Bulk Optimize Selected ({selectedIds.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {!aiEnabled && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-4 transition-all">
          <span>AI SEO features are globally disabled. Turn on the switch in the SEO Settings page to enable "Write AI" copy generation.</span>
          <Link href="/admin/settings?tab=ai_settings" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg whitespace-nowrap">
            Go to Settings
          </Link>
        </div>
      )}

      <SEODirectoryTable
        entityType="product"
        entityLabel="Products"
        items={products}
        loading={loading}
        search={search}
        setSearch={setSearch}
        onSearchSubmit={() => { setCurrentPage(1); fetchProducts(); }}
        filter={filter}
        setFilter={setFilter}
        selectedIds={selectedIds}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        aiEnabled={aiEnabled}
        optimizingId={optimizingId}
        bulkOptimizing={bulkOptimizing}
        onOptimize={handleOptimize}
        onBulkOptimize={handleBulkOptimize}
        onPreview={(product) => { setSelectedProduct(product); setIsPreviewOpen(true); }}
        onEdit={(product) => { setSelectedProduct(product); setIsEditOpen(true); }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        setCurrentPage={setCurrentPage}
      />

      {/* Preview Modal */}
      {isPreviewOpen && selectedProduct && (
        <SEOPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          entity_type="product"
          entity_name={selectedProduct.name}
          seoData={selectedProduct.seo_meta}
          storeUrl={storeSettings?.store_url || undefined}
          storeName={storeSettings?.store_name || undefined}
        />
      )}

      {/* Edit Override Modal */}
      {isEditOpen && selectedProduct && (
        <EditSEOModal
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); fetchProducts(); }}
          entity_type="product"
          entity_id={selectedProduct.id}
          seoData={selectedProduct.seo_meta}
        />
      )}
    </div>
  );
}
