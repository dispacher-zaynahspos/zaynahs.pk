'use client';

import React from 'react';
import { X, Mail } from '@/components/common/Icons';
import { Modal } from '@/components/common/Modal';
import { EmailTemplate } from './types';

interface EmailPreviewModalProps {
  showPreviewModal: boolean;
  setShowPreviewModal: (v: boolean) => void;
  template: EmailTemplate;
  previewContent: { subject: string; html: string } | null;
  previewLoading: boolean;
  sendingTest: boolean;
  handleSendTest: () => void;
}

export default function EmailPreviewModal({
  showPreviewModal,
  setShowPreviewModal,
  template,
  previewContent,
  previewLoading,
  sendingTest,
  handleSendTest,
}: EmailPreviewModalProps) {
  return (
    <Modal
      open={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      variant="sheet"
      size="lg"
      showClose={false}
      className="!bg-transparent !border-0 !shadow-none !rounded-none !overflow-visible !max-h-[92dvh] sm:!max-h-[90vh]"
    >
      <div className="bg-white dark:bg-[#16162a] w-full rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Preview: {template.label}
            </h3>
            {previewContent && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                Subject: <span className="font-semibold text-gray-750 dark:text-gray-300">{previewContent.subject}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowPreviewModal(false)}
            aria-label="Close preview"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Iframe */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-black/20 flex flex-col justify-center min-h-[300px]">
          {previewLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e94560]" />
              <p className="text-xs text-gray-500 font-semibold">Generating template mock preview...</p>
            </div>
          ) : previewContent ? (
            <iframe
              title="Email Preview"
              srcDoc={previewContent.html}
              className="w-full h-[450px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white"
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-gray-500 font-semibold">Failed to load preview details.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111122] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            onClick={handleSendTest}
            disabled={sendingTest || !previewContent}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-gray-250 dark:border-gray-855 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-750 dark:text-gray-300 px-5 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{sendingTest ? 'Sending Test...' : 'Send Test to My Email'}</span>
          </button>
          <button
            onClick={() => setShowPreviewModal(false)}
            className="flex-1 sm:flex-initial flex items-center justify-center rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 px-6 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-bold transition-all cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
}
