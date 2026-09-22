import React, { useState, useRef, useEffect } from 'react';
import { Category } from '@/lib/types';
import { createCategorySafe, updateCategorySafe, deleteCategorySafe } from '@/lib/services/categories';
import { createClient } from '@/lib/supabase/client';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';
import { getClientSiteUrl } from '@/lib/site-url';
import { useCategoryImportExport } from './useCategoryImportExport';

interface UseCategoryManagerStateProps {
  initialCategories: Category[];
  aiEnabled?: boolean;
  storeUrl?: string;
}

export function useCategoryManagerState({
  initialCategories,
  aiEnabled,
  storeUrl,
}: UseCategoryManagerStateProps) {
  const { confirm } = useConfirm();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('sort-order');

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiConfigured] = useState<boolean>(aiEnabled ?? false);

  const { handleExportJSON, handleImportJSON } = useCategoryImportExport({
    categories,
    setCategories,
    selectedCategoryIds,
    setSelectedCategoryIds,
  });

  useEffect(() => {
    if (!editId && name) {
      const timer = setTimeout(() => {
        setSlug(
          name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [name, editId]);

  const handleAICopywrite = async () => {
    if (!name.trim()) {
      return toast.error('Please enter a Category Name first before generating AI description.');
    }
    if (!aiConfigured) {
      return toast.info('AI is not enabled. Go to Admin → Settings → AI Copywriter to enable it.', {
        duration: 5000,
      });
    }
    try {
      setIsAiGenerating(true);
      toast.info('AI is drafting professional category copy...');

      const payload = {
        entity_type: 'category',
        entity_id: editId || 'new',
        entity_data: {
          name: name.trim(),
          description: description.trim() || undefined,
          slug: slug.trim(),
        },
      };

      const response = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleOpenNew = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder('0');
    setActive(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setSortOrder(cat.sortOrder.toString());
    setActive(cat.active);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this category to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    try {
      const result = await deleteCategorySafe(id);
      if (!result.success) throw new Error(result.error);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedCategoryIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Category moved to Trash successfully');
    } catch {
      toast.error('Failed to move category to Trash');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category Name is required');
    if (!slug.trim()) return toast.error('Category Slug is required');

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      sortOrder: parseInt(sortOrder) || 0,
      active,
    };

    try {
      let savedCategory: Category;
      if (editId) {
        const result = await updateCategorySafe(editId, payload);
        if (!result.success) throw new Error(result.error);
        savedCategory = result.data;
        setCategories((prev) => prev.map((c) => (c.id === editId ? savedCategory : c)));
        toast.success('Category updated successfully');
      } else {
        const result = await createCategorySafe(payload);
        if (!result.success) throw new Error(result.error);
        savedCategory = result.data;
        setCategories((prev) => [...prev, savedCategory]);
        toast.success('Category created successfully');
      }
      setIsOpen(false);

      const supabase = createClient();
      const { data: aiSettings } = await supabase
        .from('ai_settings')
        .select('auto_content_seo')
        .eq('id', '00000000-0000-4000-8000-000000000002')
        .single();

      const isAutoSeoOn = aiSettings?.auto_content_seo ?? true;
      const categoryIdToOptimize = savedCategory.id;
      const categorySlugToOptimize = savedCategory.slug;

      (async () => {
        try {
          if (isAutoSeoOn) {
            toast.info('Generating AI SEO content and pinging IndexNow...');
            const optRes = await fetch('/api/seo/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entity_type: 'category',
                entity_id: categoryIdToOptimize,
              }),
            });
            const resData = await optRes.json();
            if (optRes.ok && resData.success) {
              toast.success('AI SEO optimization complete & IndexNow notified for category!');
            } else {
              console.warn('Auto SEO optimization failed on save for category:', resData?.error);
              toast.warning(`SEO auto-generation skipped: ${resData?.error || 'AI not configured'}`);
            }
          } else {
            const siteUrl = storeUrl || getClientSiteUrl();
            const pageUrl = `${siteUrl}/shop?category=${categorySlugToOptimize}`;
            const pingRes = await fetch('/api/indexnow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                urls: [pageUrl],
              }),
            });
            if (pingRes.ok) {
              toast.success('IndexNow notified of updated category!');
            }
          }
        } catch (bgErr) {
          console.error('Error running background SEO tasks:', bgErr);
        }
      })();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save category';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAndSortedCategories = categories
    .filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'created-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'alphabetical-asc':
          return a.name.localeCompare(b.name);
        case 'alphabetical-desc':
          return b.name.localeCompare(a.name);
        case 'sort-order':
        default:
          if ((a.sortOrder ?? 0) === (b.sortOrder ?? 0)) {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          }
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
    });

  const flattenedCategories = filteredAndSortedCategories.map((c) => ({ ...c, _level: 0 }));

  return {
    categories,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isOpen,
    setIsOpen,
    editId,
    name,
    setName,
    slug,
    setSlug,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    sortOrder,
    setSortOrder,
    active,
    setActive,
    isMediaModalOpen,
    setIsMediaModalOpen,
    isAiGenerating,
    isSubmitting,
    selectedCategoryIds,
    setSelectedCategoryIds,
    fileInputRef,
    aiConfigured,
    handleAICopywrite,
    handleOpenNew,
    handleOpenEdit,
    handleDelete,
    handleExportJSON,
    handleImportJSON,
    handleSubmit,
    filteredAndSortedCategories,
    flattenedCategories,
  };
}
