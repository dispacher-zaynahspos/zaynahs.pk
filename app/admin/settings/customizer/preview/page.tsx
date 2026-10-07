import React from 'react';
import { getHomepageSections } from '@/lib/services/sections';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { getCollections } from '@/lib/services/collections';
import { getSettings } from '@/lib/services/settings';
import { getTopReviews } from '@/lib/services/reviews';
import PreviewClient from './PreviewClient';

export const revalidate = 0; // Dynamic server rendering

export default async function CustomizerPreviewPage() {
  const [sections, products, categories, collections, settings, reviews] = await Promise.all([
    getHomepageSections(false),
    getProducts(),
    getCategories(),
    getCollections(),
    getSettings(),
    getTopReviews(8)
  ]);

  return (
    <PreviewClient
      initialSections={sections}
      products={products}
      categories={categories}
      collections={collections}
      initialSettings={settings}
      reviews={reviews}
    />
  );
}
