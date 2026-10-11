import React from 'react';
import { notFound } from 'next/navigation';
import CategoryDetailManager from '@/components/admin/CategoryDetailManager';
import { getCategoryById } from '@/lib/services/categories';
import { getProductsByCategoryId } from '@/lib/services/products';

export const revalidate = 0; // Dynamic server rendering

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { id } = await params;

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  // Every category — including the system "Shop" category — reads products in
  // its OWN saved per-category manual order (product_categories.position).
  // Previously the Shop category used getProducts() (global sort_order), so a
  // reorder saved to Shop's position never showed on reload. (RULE SORT1)
  const products = await getProductsByCategoryId(id);

  return (
    <CategoryDetailManager category={category} initialProducts={products} />
  );
}
