'use client';

import React from 'react';
import { HomepageSection, Product, Category } from '@/lib/types';
import {
  FlashSaleCategoryRules,
  FlashSaleProductManager,
  FlashSaleGeneralConfig,
} from './flash-sale';

interface FlashSaleSettingsProps {
  section: HomepageSection;
  products: Product[];
  categories: Category[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FlashSaleSettings({
  section,
  products,
  categories,
  onUpdateSection
}: FlashSaleSettingsProps) {
  return (
    <div className="space-y-5">
      <FlashSaleGeneralConfig
        section={section}
        onUpdateSection={onUpdateSection}
      />

      {/* CATEGORY LEVEL DISCOUNT MANAGER */}
      <FlashSaleCategoryRules
        section={section}
        categories={categories}
        onUpdateSection={onUpdateSection}
      />

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* INDIVIDUAL PRODUCT MANAGER */}
      <FlashSaleProductManager
        section={section}
        products={products}
        onUpdateSection={onUpdateSection}
      />
    </div>
  );
}
