'use client';

import { useState } from 'react';
import { Category, Product } from '@/lib/types';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils/slugify';

interface UseProductFormAiCopywriteProps {
  name: string;
  setName?: (name: string) => void;
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
  setImages?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useProductFormAiCopywrite({
  name,
  setName,
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
  setImages,
}: UseProductFormAiCopywriteProps) {
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAICopywrite = async () => {
    if (!name.trim()) {
      return toast.error('Please enter a Product Name first before generating AI description.');
    }
    try {
      setIsAiGenerating(true);
      toast.info('AI is drafting professional SEO product copy...');

      const generatedSlug = slugify(name);
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
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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

        // Apply SEO Title (Formula: [Gender] [Product] [Fabric] [Age] – [Season] | [Brand], <=60 chars)
        if (data.seo_title && setName) {
          setName(data.seo_title);
          setSlug(slugify(data.seo_title));
        }

        // Apply Image Alt Text (Formula: [Gender] [Color] [Product] [Age Range] Pakistan)
        if (data.image_alt && setImages) {
          setImages((prev) =>
            prev.map((img, idx) => ({
              ...img,
              alt: (!img.alt || idx === 0) ? data.image_alt : img.alt,
            }))
          );
        }

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
        toast.success('AI Title, Alt text, Description, Short description, and tags generated successfully!');
      }
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      const message = err instanceof Error ? err.message : '';
      if (name === 'AbortError' || message.includes('abort') || message.includes('aborted')) {
        toast.error('AI generation timed out. Please try again or switch model provider in Settings.');
      } else {
        toast.error(message || 'AI generation failed');
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  return {
    isAiGenerating,
    handleAICopywrite,
  };
}
