import { Category } from '@/lib/types';

// Tree logic is deprecated. Return flat categories.
export const buildCategoryTree = (categories: Category[]): Category[] => {
  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
};
