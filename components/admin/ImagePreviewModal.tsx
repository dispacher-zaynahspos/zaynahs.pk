import React from 'react';
import RichMediaPreviewModal from '@/components/admin/RichMediaPreviewModal';

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  if (!url) return null;
  return <RichMediaPreviewModal url={url} onClose={onClose} mode="preview" />;
}
