'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { createCategorySafe, updateCategorySafe } from '@/lib/services/categories';
import { toast } from 'sonner';

interface UseCategoryImportExportProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategoryIds: Set<string>;
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useCategoryImportExport({
  categories,
  setCategories,
  selectedCategoryIds,
  setSelectedCategoryIds,
}: UseCategoryImportExportProps) {

  const handleExportJSON = () => {
    try {
      const toExport =
        selectedCategoryIds.size > 0
          ? categories.filter((c) => selectedCategoryIds.has(c.id) && c.id !== '00000000-0000-4000-8000-000000000099')
          : categories.filter((c) => c.id !== '00000000-0000-4000-8000-000000000099');
      if (toExport.length === 0) return toast.error('No categories to export');

      const exportData = toExport.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        imageUrl: c.imageUrl || null,
        sortOrder: c.sortOrder,
        active: c.active,
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSelectedCategoryIds(new Set());
      toast.success('Categories exported successfully.');
    } catch {
      toast.error('Failed to export categories');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) return toast.error('Invalid format. Must be a JSON array.');

        let imported = 0,
          updated = 0;
        const newCategories = [...categories];
        toast.info('Importing categories, please wait...');

        for (const item of json) {
          if (!item.name || !item.slug) continue;
          if (item.slug.toLowerCase() === 'shop') continue;
          const existing = newCategories.find((c) => c.slug.toLowerCase() === item.slug.toLowerCase());

          const payload = {
            name: item.name,
            slug: item.slug,
            description: item.description || undefined,
            imageUrl: item.imageUrl || undefined,
            sortOrder: item.sortOrder || 0,
            active: item.active ?? true,
          };

          if (existing) {
            const result = await updateCategorySafe(existing.id, payload);
            if (!result.success) throw new Error(result.error);
            const idx = newCategories.findIndex((c) => c.id === existing.id);
            if (idx !== -1) newCategories[idx] = result.data;
            updated++;
          } else {
            const result = await createCategorySafe(payload);
            if (!result.success) throw new Error(result.error);
            newCategories.push(result.data);
            imported++;
          }
        }
        setCategories(newCategories);
        toast.success(`Import complete: ${imported} created, ${updated} updated.`);
      } catch {
        toast.error('Failed to parse and import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return {
    handleExportJSON,
    handleImportJSON,
  };
}
