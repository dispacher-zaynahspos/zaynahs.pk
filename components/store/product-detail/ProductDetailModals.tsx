'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from '@/components/common/Icons';
import { StoreSettings, Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductDetailModalsProps {
  product: Product;
  settings: StoreSettings;
  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  showSizeGuide: boolean;
  setShowSizeGuide: (show: boolean) => void;
  productUrl: string;
  copied: boolean;
  onCopyLink: () => void;
}

export default function ProductDetailModals({
  product,
  settings,
  isShareOpen,
  setIsShareOpen,
  showSizeGuide,
  setShowSizeGuide,
  productUrl,
  copied,
  onCopyLink,
}: ProductDetailModalsProps) {
  const [mounted, setMounted] = useState(false);
  const sizeGuide = product.sizeGuide;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Share Modal */}
      {isShareOpen && createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 animate-fade-in touch-none"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 text-gray-900 dark:text-white transition-all space-y-4 scale-up duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Copy link</h3>
              <button
                onClick={() => setIsShareOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input with Copy button */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={productUrl}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm font-semibold select-all focus:outline-none"
              />
              <button
                onClick={onCopyLink}
                className="bg-[#1a1a2e] hover:bg-[#e94560] dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-xl px-4 py-2.5 flex items-center justify-center cursor-pointer transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Social Sharing Icons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Share on socials</span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-colors cursor-pointer"
                  title="Share on Facebook"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white transition-colors cursor-pointer"
                  title="Share on X"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#BD081C]/10 hover:bg-[#BD081C]/20 text-[#BD081C] transition-colors cursor-pointer"
                  title="Share on Pinterest"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.718-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.166-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026z" />
                  </svg>
                </a>

                {/* Instagram */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(productUrl);
                    toast.success('Link copied! Open Instagram to share.');
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E1306C]/10 hover:bg-[#E1306C]/20 text-[#E1306C] transition-colors cursor-pointer"
                  title="Copy link for Instagram"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sizing Guide Modal */}
      {showSizeGuide && settings.size_guide_enabled !== false && sizeGuide && createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 overscroll-contain animate-fade-in"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overscroll-contain scale-up duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              📏 {sizeGuide.name}
            </h3>

            {sizeGuide.imageUrl && (
              <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 mb-6 border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sizeGuide.imageUrl}
                  alt={`${sizeGuide.name} visual reference`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {sizeGuide.chart_data && sizeGuide.chart_data.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0f0f1b]/50">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs text-left border-collapse min-w-[320px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                        {Object.keys(sizeGuide.chart_data[0]).map((colName) => (
                          <th key={colName} className="p-3 font-extrabold uppercase text-gray-500 dark:text-gray-400">
                            {colName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {sizeGuide.chart_data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/20">
                          {Object.keys(sizeGuide.chart_data[0]).map((colName) => (
                            <td key={colName} className="p-3 font-semibold text-gray-700 dark:text-gray-300">
                              {row[colName] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="mt-4 text-[10px] text-gray-400 text-center leading-normal">
              Sizes may vary slightly. For questions or custom sizing, contact support via WhatsApp.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
