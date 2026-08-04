import React from 'react';

interface AvailabilityState {
  onSale: boolean;
  inStock: boolean;
  outStock: boolean;
}

interface AvailabilityFilterProps {
  availability: AvailabilityState;
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityState>>;
}

export default function AvailabilityFilter({
  availability,
  setAvailability
}: AvailabilityFilterProps) {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Availability</span>
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={availability.onSale}
            onChange={(e) => setAvailability(prev => ({ ...prev, onSale: e.target.checked }))}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
          />
          <span>On sale</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={availability.inStock}
            onChange={(e) => setAvailability(prev => ({ ...prev, inStock: e.target.checked }))}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
          />
          <span>In stock</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={availability.outStock}
            onChange={(e) => setAvailability(prev => ({ ...prev, outStock: e.target.checked }))}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
          />
          <span>Out of stock</span>
        </label>
      </div>
    </div>
  );
}
