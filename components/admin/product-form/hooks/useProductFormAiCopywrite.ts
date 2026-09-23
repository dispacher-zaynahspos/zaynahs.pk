'use client';

import { useState } from 'react';
import { Category, Product } from '@/lib/types';
import { toast } from 'sonner';

interface UseProductFormAiCopywriteProps {
  name: string;
  setSlug: (slug: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  price: string;
  categoryId: string;
  categories: Category[];
  initialProduct?: Product | null;
  setShortDescription: (desc: string) => void;
  setTagInput: (tags: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function useProductFormAiCopywrite({
  name,
  setSlug,
  description,
  setDescription,
  price,
  categoryId,
  categories,
  initialProduct,
  setShortDescription,
  setTagInput,
  editorRef,
}: UseProductFormAiCopywriteProps) {
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAICopywrite = async () => {
    if (!name.trim()) {
      return toast.error('Please enter a Product Name first before generating AI description.');
    }
    try {
      setIsAiGenerating(true);
      toast.info('AI is drafting professional SEO product copy...');

      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);

      const selectedCategory = categories.find((c) => c.id === categoryId);
      const categoryName = selectedCategory ? selectedCategory.name : 'General';

      const payload = {
        entity_type: 'product',
        entity_id: initialProduct?.id || 'new',
        entity_data: {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price) || 0,
          category: categoryName,
          stock: 10,
          slug: generatedSlug,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.error || 'AI generation failed');

      if (resData.skipped) {
        toast.warning(resData.message || 'AI keys not configured');
      } else {
        const data = resData.data;
        if (data.long_description) {
          setDescription(data.long_description);
          if (editorRef.current) {
            editorRef.current.innerHTML = data.long_description;
          }
        }
        if (data.meta_description) {
          setShortDescription(data.meta_description);
        }
        if (data.focus_keyword || data.secondary_keywords) {
          const combinedTags = [data.focus_keyword, data.secondary_keywords, data.lsi_tags]
            .filter(Boolean)
            .join(', ');

          const uniqueTags = Array.from(
            new Set(combinedTags.split(',').map((t) => t.trim()).filter(Boolean))
          ).join(', ');

          setTagInput(uniqueTags);
        }
        toast.success('AI description, short description, and tags generated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return {
    isAiGenerating,
    handleAICopywrite,
  };
}
