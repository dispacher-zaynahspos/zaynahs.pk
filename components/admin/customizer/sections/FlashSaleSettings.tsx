'use client';

import React from 'react';
import { HomepageSection, Product, Category } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';
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
    <div className="space-y-3">
      <AccordionGroup id={`fs-${section.id}-general`} title="General & Layout" defaultOpen>
        <div className="pt-2">
          <FlashSaleGeneralConfig
            section={section}
            onUpdateSection={onUpdateSection}
          />
        </div>
      </AccordionGroup>

      <AccordionGroup id={`fs-${section.id}-category`} title="Category Discount Rules" defaultOpen={false}>
        <div className="pt-2">
          <FlashSaleCategoryRules
            section={section}
            categories={categories}
            onUpdateSection={onUpdateSection}
          />
        </div>
      </AccordionGroup>

      <AccordionGroup id={`fs-${section.id}-products`} title="Individual Products" defaultOpen={false}>
        <div className="pt-2">
          <FlashSaleProductManager
            section={section}
            products={products}
            onUpdateSection={onUpdateSection}
          />
        </div>
      </AccordionGroup>
    </div>
  );
}
