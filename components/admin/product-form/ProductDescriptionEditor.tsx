'use client';

import React from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface ProductDescriptionEditorProps {
  description: string;
  setDescription: (val: string) => void;
  isHtmlMode?: boolean;
  setIsHtmlMode?: (val: boolean) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  execCommand?: (cmd: string, val?: string) => void;
}

export function ProductDescriptionEditor({
  description,
  setDescription,
  editorRef,
}: ProductDescriptionEditorProps) {
  return (
    <div>
      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        Description
      </label>
      <RichTextEditor
        value={description}
        onChange={setDescription}
        editorRef={editorRef}
        placeholder="Write detailed product description, features, specs, care instructions..."
        minHeight="180px"
      />
    </div>
  );
}
