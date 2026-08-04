import React from 'react';
import { ShoppingBag } from '@/components/common/Icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "No products found",
  description = "Try adjusting your search or filters to find what you are looking for.",
  icon,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 border border-gray-100 dark:border-gray-800 mb-4">
        {icon || <ShoppingBag className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
