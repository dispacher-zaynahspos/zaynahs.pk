import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  if (!url) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-0 md:-top-12 md:-right-4 p-2 text-white hover:bg-white/20 bg-black/50 md:bg-transparent rounded-full transition-all z-[10000] cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={url} 
          alt="Preview" 
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white dark:bg-[#16162a] border border-white/10" 
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
