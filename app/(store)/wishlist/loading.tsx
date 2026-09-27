import React from 'react';
import ProductGridSkeleton from '@/components/store/shared/ProductGridSkeleton';

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-44 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <ProductGridSkeleton count={6} columnsDesktop={4} columnsTablet={3} columnsMobile={2} />
    </div>
  );
}
