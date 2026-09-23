import React from 'react';
import { AlertTriangle } from '@/components/common/Icons';
import { Product } from '@/lib/types';

export const getStockBadge = (stock: number, threshold: number = 5) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 whitespace-nowrap flex-shrink-0 leading-none">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap leading-none">Out of Stock</span>
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 whitespace-nowrap flex-shrink-0 leading-none">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap leading-none">Low Stock ({stock})</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 whitespace-nowrap flex-shrink-0 leading-none">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      <span className="whitespace-nowrap leading-none">In Stock ({stock})</span>
    </span>
  );
};

export const renderProductStatus = (product: Product) => {
  if (!product.hasVariants) {
    const threshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null ? product.inventoryThreshold : 5;
    return getStockBadge(product.stock, threshold);
  }
  
  if (product.stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 whitespace-nowrap flex-shrink-0 leading-none">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap leading-none">Out of Stock</span>
      </span>
    );
  }

  const totalLow = product.variants.filter(v => {
    const threshold = v.inventoryThreshold !== undefined && v.inventoryThreshold !== null ? v.inventoryThreshold : 5;
    return v.stock <= threshold;
  }).length;
  
  const totalIn = product.variants.filter(v => {
    const threshold = v.inventoryThreshold !== undefined && v.inventoryThreshold !== null ? v.inventoryThreshold : 5;
    return v.stock > threshold;
  }).length;

  return (
    <div className="flex flex-nowrap items-center gap-1.5 justify-end">
      {totalLow > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 whitespace-nowrap flex-shrink-0 leading-none">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap leading-none">Low Stock ({totalLow})</span>
        </span>
      )}
      {totalIn > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 whitespace-nowrap flex-shrink-0 leading-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="whitespace-nowrap leading-none">In Stock ({totalIn})</span>
        </span>
      )}
      {product.variants.length === 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 whitespace-nowrap flex-shrink-0 leading-none">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap leading-none">No Variants</span>
        </span>
      )}
    </div>
  );
};
