import React from 'react';
import { AlertTriangle } from '@/components/common/Icons';
import { Product } from '@/lib/types';

export const getStockBadge = (stock: number, threshold: number = 5) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
        <AlertTriangle className="h-3 w-3" />
        <span>Out of Stock</span>
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        <span>Low Stock ({stock})</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span>In Stock ({stock})</span>
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
        <AlertTriangle className="h-3 w-3" />
        <span>Out of Stock</span>
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
    <div className="flex flex-wrap gap-1.5 justify-end">
      {totalLow > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          <span>Low Stock ({totalLow})</span>
        </span>
      )}
      {totalIn > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>In Stock ({totalIn})</span>
        </span>
      )}
      {product.variants.length === 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          <span>No Variants</span>
        </span>
      )}
    </div>
  );
};
