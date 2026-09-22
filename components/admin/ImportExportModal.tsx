'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Product } from '@/lib/types';
import { exportProducts, importProductsStream } from '@/lib/services/importExport';
import { toast } from 'sonner';
import {
  X,
  FileDown,
  FileUp,
  PackageOpen
} from '@/components/common/Icons';
import { ExportTabContent, ImportTabContent } from './import-export';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onImportComplete: () => void;
}

interface ImportProgressLog {
  productName: string;
  status: 'skipped' | 'overwritten' | 'imported' | 'error';
  message?: string;
  error?: string;
}

export default function ImportExportModal({
  isOpen,
  onClose,
  products,
  onImportComplete
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // --- Export Tab State ---
  const [exportSearch, setExportSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // --- Import Tab State ---
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMeta, setImportMeta] = useState<{
    version: string;
    storeName: string;
    productCount: number;
    exportedAt: string;
  } | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite' | 'rename'>('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importLogs, setImportLogs] = useState<ImportProgressLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive unique categories from products list
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => {
      if (p.category) {
        map.set(p.category.slug, p.category.name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  // Filtered products for export list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(exportSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(exportSearch.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || (p.category && p.category.slug === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [products, exportSearch, selectedCategory]);

  const allFilteredSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every(p => selectedIds.has(p.id));
  }, [filteredProducts, selectedIds]);

  // Handlers
  const handleToggleSelectProduct = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredProducts.forEach(p => next.delete(p.id));
      } else {
        filteredProducts.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one product to export.');
      return;
    }

    setIsExporting(true);
    const idArray = Array.from(selectedIds);
    const toastId = toast.loading(`Preparing export bundle for ${idArray.length} product(s)...`);

    try {
      const bundle = await exportProducts(idArray);
      const dataStr = JSON.stringify(bundle, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      const storePrefix = bundle.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `${storePrefix}-products-${timestamp}.zaynah-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Products exported successfully!', { id: toastId });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Export failed', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid Zaynah export JSON file.');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.version !== '1.0' || !Array.isArray(data.products)) {
        throw new Error('Unsupported or invalid export file format.');
      }

      setImportFile(file);
      setImportMeta({
        version: data.version,
        storeName: data.storeName || 'Unknown Store',
        productCount: data.products.length,
        exportedAt: data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'Unknown'
      });
      setImportLogs([]);
      setImportProgress(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to read export file');
      setImportFile(null);
      setImportMeta(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Only .json files are supported.');
      return;
    }

    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportLogs([]);
    setImportProgress({ current: 0, total: importMeta?.productCount || 0 });
    const toastId = toast.loading('Initializing product import...');

    try {
      await importProductsStream(importFile, conflictStrategy, (progress) => {
        if (progress.type === 'start') {
          setImportProgress({ current: 0, total: progress.total });
        } else {
          setImportProgress(prev => {
            if (!prev) return null;
            return { ...prev, current: prev.current + 1 };
          });
          setImportLogs(prev => [...prev, progress]);
        }
      });

      toast.success('Import process completed!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Import failed midway', { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportClose = () => {
    if (importLogs.length > 0) {
      onImportComplete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-6 overflow-y-auto">
      <div 
        className="relative flex flex-col bg-white dark:bg-[#121224] w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800/80 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PackageOpen className="w-6 h-6 text-[#e94560]" />
              Import / Export Products
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Transfer products fully configured with images, variants, modifiers, and categories.
            </p>
          </div>
          <button 
            type="button"
            onClick={isImporting ? handleImportClose : onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
            disabled={isExporting || isImporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={() => !isImporting && setActiveTab('export')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-[#e94560] text-[#e94560] dark:text-[#e94560]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            disabled={isExporting || isImporting}
          >
            <FileDown className="w-4 h-4" />
            Export Catalog
          </button>
          <button
            type="button"
            onClick={() => !isImporting && setActiveTab('import')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-[#e94560] text-[#e94560] dark:text-[#e94560]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            disabled={isExporting || isImporting}
          >
            <FileUp className="w-4 h-4" />
            Import Catalog
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' ? (
            <ExportTabContent
              products={products}
              filteredProducts={filteredProducts}
              exportSearch={exportSearch}
              setExportSearch={setExportSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              selectedIds={selectedIds}
              allFilteredSelected={allFilteredSelected}
              onToggleSelectProduct={handleToggleSelectProduct}
              onToggleSelectAllFiltered={handleToggleSelectAllFiltered}
              onExport={handleExport}
              onClose={onClose}
              isExporting={isExporting}
            />
          ) : (
            <ImportTabContent
              importFile={importFile}
              setImportFile={setImportFile}
              importMeta={importMeta}
              setImportMeta={setImportMeta}
              conflictStrategy={conflictStrategy}
              setConflictStrategy={setConflictStrategy}
              isImporting={isImporting}
              importProgress={importProgress}
              importLogs={importLogs}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleImport={handleImport}
              handleImportClose={handleImportClose}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
