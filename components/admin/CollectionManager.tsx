'use client';

import React, { useState } from 'react';
import { Plus } from '@/components/common/Icons';
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
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import { CollectionTable, CollectionFormModal } from './collection-manager';

interface CollectionManagerProps {
  initialCollections: Collection[];
  categories: Category[];
  aiEnabled?: boolean;
  storeUrl?: string;
}

export default function CollectionManager({ initialCollections, categories, aiEnabled }: CollectionManagerProps) {
  const { confirm } = useConfirm();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditId(null);
    setEditingCollection(null);
    setIsOpen(true);
  };

  const handleEdit = (col: Collection) => {
    setEditId(col.id);
    setEditingCollection(col);
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
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('Collection moved to Trash');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete collection');
    }
  };

  const handleSaveCollection = async (payload: Collection, assignedCategories: Category[]) => {
    let savedCollection: Collection;

    if (editId) {
      const result = await updateCollectionSafe(editId, payload);
      if (!result.success) throw new Error(result.error);
      savedCollection = result.data;
      
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
      
      setCollections(prev => prev.map(c => c.id === editId ? savedCollection : c));
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
      setCollections(prev => [...prev, savedCollection]);
      toast.success('Collection created successfully');
    }
    setIsOpen(false);
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
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e94560] hover:bg-[#d63d56] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-[#e94560]/20 cursor-pointer"
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

        <CollectionTable
          collections={collections}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreviewImage={setPreviewImageUrl}
        />
      </div>

      {isOpen && (
        <CollectionFormModal
          editId={editId}
          initialData={editingCollection}
          categories={categories}
          aiEnabled={aiEnabled}
          onClose={() => setIsOpen(false)}
          onSubmitSuccess={handleSaveCollection}
        />
      )}

      <ImagePreviewModal 
        url={previewImageUrl} 
        onClose={() => setPreviewImageUrl(null)} 
      />
    </div>
  );
}
