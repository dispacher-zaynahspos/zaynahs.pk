import React, { useState, useEffect } from 'react';
import { Eye, Package } from '@/components/common/Icons';

interface TableThumbnailProps {
  url: string | null;
  alt: string;
  onPreview: (url: string) => void;
  className?: string; // Optional override for outer div
  fallbackIcon?: React.ReactNode;
}

export default function TableThumbnail({ 
  url, 
  alt, 
  onPreview, 
  className = "h-10 w-10",
  fallbackIcon 
}: TableThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url || hasError) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold ${className}`}>
        {fallbackIcon || <Package className="h-5 w-5 text-gray-400" />}
      </div>
    );
  }

  return (
    <div className={`group relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700 flex-shrink-0 cursor-pointer ${className}`} onClick={(e) => { e.stopPropagation(); onPreview(url); }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Eye className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}
