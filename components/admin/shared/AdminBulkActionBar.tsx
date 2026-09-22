import React from 'react';

interface AdminBulkActionBarProps {
  selectedCount: number;
  actions: React.ReactNode;
  onClearSelection?: () => void;
}

export default function AdminBulkActionBar({ selectedCount, actions, onClearSelection }: AdminBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 w-[92%] max-w-lg select-none">
      <div className="bg-[#1a1a2e] text-white rounded-2xl shadow-2xl p-3 sm:p-3.5 flex items-center justify-between border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#e94560] text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-black shadow-xs">
            {selectedCount}
          </div>
          <span className="text-xs font-bold tracking-tight text-white">Selected</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
          {onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

