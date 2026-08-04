'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, Trash2, X } from '@/components/common/Icons';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within an AdminConfirmProvider');
  }
  return context;
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolveFn) resolveFn(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolveFn) resolveFn(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#16162a] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 text-center space-y-4">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                options.variant === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500' :
                options.variant === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500'
              }`}>
                {options.variant === 'danger' ? (
                  <Trash2 className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {options.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {options.message}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0f0f1b] px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${
                  options.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  options.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
