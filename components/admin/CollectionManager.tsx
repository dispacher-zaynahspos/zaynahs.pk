'use client';

import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, Loader2, Zap } from '@/components/common/Icons';
import { Collection, Category } from '@/lib/types';
import { 
  createCollectionSafe, 
  updateCollectionSafe, 
  deleteCollectionSafe,
  assignCategoryToCollectionSafe,
  removeCategoryFromCollectionSafe,
  reorderCollectionCategoriesSafe
} from '@/lib/services/collections';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';
import MediaSelectorModal from './MediaSelectorModal';
import RichTextEditor from './RichTextEditor';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import TableThumbnail from '@/components/admin/TableThumbnail';

interface CollectionManagerProps {
  initialCollections: Collection[];
  categories: Category[];
  aiEnabled?: boolean;
  storeUrl?: string;
}

export default function CollectionManager({ initialCollections, categories, aiEnabled, storeUrl }: CollectionManagerProps) {
  const { confirm } = useConfirm();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);
  
  // Categories Assignment fields
  const [assignedCategories, setAssignedCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryInputFocused, setIsCategoryInputFocused] = useState(false);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiConfigured] = useState<boolean>(aiEnabled ?? false);

  const handleAICopywrite = async () => {
    if (!name.trim()) {
      return toast.error('Please enter a Collection Name first before generating AI description.');
    }
    try {
      setIsAiGenerating(true);
      toast.info('AI is drafting professional collection copy...');

      const payload = {
        entity_type: 'collection',
        entity_id: editId || 'new',
        entity_data: {
          name: name.trim(),
          description: description.trim() || undefined,
          slug: slug.trim()
        }
      };

      const response = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.error || 'AI generation failed');

      if (resData.skipped) {
        toast.warning(resData.message || 'AI keys not configured');
      } else {
        const data = resData.data;
        if (data.long_description) {
          setDescription(data.long_description);
        }
        toast.success('AI description generated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Auto-fill slug
  React.useEffect(() => {
    if (!editId && name) {
      const timer = setTimeout(() => {
        setSlug(
          name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [name, editId]);

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCategories = categories.filter(c => 
    !assignedCategories.find(ac => ac.id === c.id) &&
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  ).slice(0, 5); // Show top 5 matches

  const resetForm = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder('0');
    setActive(true);
    setAssignedCategories([]);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleEdit = (col: Collection) => {
    setEditId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImageUrl(col.imageUrl || '');
    setSortOrder(col.sortOrder.toString());
    setActive(col.active);
    setAssignedCategories(col.categories || []);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, colName: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Collection',
      message: `Are you sure you want to delete the collection "${colName}"? This will not delete the categories inside it.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!isConfirmed) return;

    try {
      const result = await deleteCollectionSafe(id);
      if (!result.success) throw new Error(result.error);
      setCollections(collections.filter(c => c.id !== id));
      toast.success('Collection moved to Trash');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete collection');
    }
  };

  const handleAssignCategory = (cat: Category) => {
    setAssignedCategories([...assignedCategories, cat]);
    setCategorySearch('');
  };

  const handleRemoveCategory = (catId: string) => {
    setAssignedCategories(assignedCategories.filter(c => c.id !== catId));
  };

  const handleMoveCategory = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx > 0) {
      const newArr = [...assignedCategories];
      [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      setAssignedCategories(newArr);
    } else if (direction === 'down' && idx < assignedCategories.length - 1) {
      const newArr = [...assignedCategories];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      setAssignedCategories(newArr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Collection Name is required');
    if (!slug.trim()) return toast.error('Collection Slug is required');

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      sortOrder: parseInt(sortOrder) || 0,
      active
    };

    try {
      let savedCollection: Collection;

      if (editId) {
        const result = await updateCollectionSafe(editId, payload);
        if (!result.success) throw new Error(result.error);
        savedCollection = result.data;
        
        // Sync Categories manually for UX, though a real app might bulk update
        const existingCol = collections.find(c => c.id === editId);
        const oldCats = existingCol?.categories || [];
        
        // Remove unassigned
        for (const oc of oldCats) {
          if (!assignedCategories.find(ac => ac.id === oc.id)) {
            await removeCategoryFromCollectionSafe(editId, oc.id);
          }
        }
        // Add new
        for (const ac of assignedCategories) {
          if (!oldCats.find(oc => oc.id === ac.id)) {
            await assignCategoryToCollectionSafe(editId, ac.id);
          }
        }
        // Reorder
        await reorderCollectionCategoriesSafe(editId, assignedCategories.map(c => c.id));
        
        savedCollection.categories = assignedCategories;
        
        setCollections(collections.map(c => c.id === editId ? savedCollection : c));
        toast.success('Collection updated successfully');
      } else {
        const result = await createCollectionSafe(payload);
        if (!result.success) throw new Error(result.error);
        savedCollection = result.data;
        
        // Assign categories
        for (let i = 0; i < assignedCategories.length; i++) {
          await assignCategoryToCollectionSafe(savedCollection.id, assignedCategories[i].id, i);
        }
        
        savedCollection.categories = assignedCategories;
        setCollections([...collections, savedCollection]);
        toast.success('Collection created successfully');
      }
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Collections <span className="text-gray-400 dark:text-gray-600 text-sm ml-2">({collections.length})</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Group your categories into top-level collections
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e94560] hover:bg-[#d63d56] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-[#e94560]/20"
        >
          <Plus className="h-4 w-4" />
          Create Collection
        </button>
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] transition-colors text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Collection</th>
                <th className="px-6 py-4">Categories Included</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Sort Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCollections.map(col => (
                <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {col.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <TableThumbnail 
                          url={col.imageUrl} 
                          alt={col.name} 
                          onPreview={setPreviewImageUrl} 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{col.name}</div>
                        <div className="text-xs text-gray-500">/{col.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(col.categories || []).map(cat => (
                        <span key={cat.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-md">
                          {cat.name}
                        </span>
                      ))}
                      {(!col.categories || col.categories.length === 0) && (
                        <span className="text-gray-400 text-xs italic">Empty</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      col.active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {col.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-500">
                    {col.sortOrder}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(col)}
                        className="p-2 text-gray-400 hover:text-[#e94560] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id, col.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16162a] w-full max-w-3xl max-h-[90vh] rounded-2xl border border-gray-250 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col animate-scale-in text-gray-900 dark:text-white overscroll-contain">
            
            {/* Sticky Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-800 shrink-0 bg-white dark:bg-[#16162a] sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {editId ? 'Edit Collection' : 'Create Collection'}
                </h3>
                {name.trim() !== '' && (
                  <button
                    type="button"
                    onClick={aiConfigured ? handleAICopywrite : () => { toast.info('AI is not enabled. Go to Admin → Settings → AI Copywriter to enable it.', { duration: 5000 }); }}
                    disabled={isAiGenerating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
                      aiConfigured
                        ? 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700 hover:from-purple-700 hover:to-indigo-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                    title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
                  >
                    {isAiGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>AI Generate Copy</span>
                  </button>
                )}
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-650 dark:hover:text-white cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Collection Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Collection Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="mt-1.5 w-full rounded-xl border border-gray-255 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                  />
                  {slug && (
                    <p className="mt-1 text-[10px] text-gray-550 dark:text-gray-400 font-bold">
                      Preview Path:{' '}
                      <a
                        href={`/shop?collection=${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e94560] font-mono underline hover:text-[#e94560]/80 transition-colors cursor-pointer"
                      >
                        /shop?collection={slug}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Collection Banner/Image</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-250 dark:border-gray-850 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                    {imageUrl ? (
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className="relative h-14 w-14 border border-gray-200 dark:border-gray-850 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] flex items-center justify-center p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt="Collection Image Preview" className="h-full w-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 shrink-0">
                        <Plus className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="relative self-start flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Select Media
                      </button>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">Select or upload WebP &lt; 50 KB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Global Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="col-active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                    />
                    <label htmlFor="col-active" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      Active (Show to customers)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Assign Categories</label>
                <div className="bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search and add categories to this collection..."
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        onFocus={() => setIsCategoryInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsCategoryInputFocused(false), 200)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-sm focus:outline-none focus:border-[#e94560] dark:text-white"
                      />
                      {(categorySearch || isCategoryInputFocused) && availableCategories.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                          {availableCategories.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleAssignCategory(cat)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between"
                            >
                              <span>{cat.name}</span>
                              <Plus className="h-4 w-4 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {assignedCategories.length > 0 ? (
                      <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-xl p-2 bg-white dark:bg-[#16162a]">
                        {assignedCategories.map((cat, idx) => (
                          <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-[#0f0f1b]">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveCategory(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCategory(idx, 'down')}
                                disabled={idx === assignedCategories.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(cat.id)}
                                className="p-1 ml-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        No categories assigned yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                  {name.trim() !== '' && (
                    <button
                      type="button"
                      onClick={aiConfigured ? handleAICopywrite : () => { toast.info('AI is not enabled. Go to Admin → Settings → AI Copywriter to enable it.', { duration: 5000 }); }}
                      disabled={isAiGenerating}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
                        aiConfigured
                          ? 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700 hover:from-purple-700 hover:to-indigo-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
                    >
                      {isAiGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>AI Generate Copy</span>
                    </button>
                  )}
                </div>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your collection..."
                  minHeight="180px"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-[#16162a]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center border border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-350 bg-white dark:bg-transparent rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`relative overflow-hidden flex-1 flex items-center justify-center text-center rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] ${
                    isSubmitting
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-[#1a1a2e] dark:bg-[#e94560] hover:opacity-90 text-white'
                  }`}
                >
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] pointer-events-none z-10 bg-inherit">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span className="text-white">Saving...</span>
                      </div>
                    </div>
                  )}
                  <span>{editId ? 'Update Collection' : 'Save Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMediaModalOpen && (
        <MediaSelectorModal
          isOpen={true}
          onSelect={(url) => {
            setImageUrl(url[0]);
            setIsMediaModalOpen(false);
          }}
          onClose={() => setIsMediaModalOpen(false)}
        />
      )}

      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
