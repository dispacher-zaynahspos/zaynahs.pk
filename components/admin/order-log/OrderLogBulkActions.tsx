'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface OrderLogBulkActionsProps {
  selectedOrderIds: string[];
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleBulkFulfil: () => Promise<void>;
  handleBulkUnfulfil: () => Promise<void>;
  handleBulkCancel: () => Promise<void>;
  handleBulkTrash: () => Promise<void>;
}

export function OrderLogBulkActions({
  selectedOrderIds,
  setSelectedOrderIds,
  handleBulkFulfil,
  handleBulkUnfulfil,
  handleBulkCancel,
  handleBulkTrash,
}: OrderLogBulkActionsProps) {
  const router = useRouter();

  if (selectedOrderIds.length === 0) return null;

  return (
    <div className="bg-[#e3f2fd] dark:bg-blue-950/40 border-x border-b border-blue-200 dark:border-blue-900/60 px-4 py-3 flex items-center justify-between animate-fade-in text-xs md:text-sm">
      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
        <span>{selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} selected</span>
        <button
          onClick={() => setSelectedOrderIds([])}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          (Clear selection)
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleBulkFulfil}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors"
        >
          Fulfill
        </button>
        <button
          onClick={handleBulkUnfulfil}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors"
        >
          Unfulfill
        </button>
        <button
          onClick={handleBulkCancel}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => router.push(`/admin/orders/postex-booking?id=${selectedOrderIds.join(',')}`)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors"
        >
          Courier Booking
        </button>
        <button
          onClick={handleBulkTrash}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-xs transition-colors"
          title="Move to trash"
        >
          Trash
        </button>
      </div>
    </div>
  );
}
