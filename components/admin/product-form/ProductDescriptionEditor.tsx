'use client';

import React from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Code, Eye } from '@/components/common/Icons';

interface ProductDescriptionEditorProps {
  description: string;
  setDescription: (val: string) => void;
  isHtmlMode: boolean;
  setIsHtmlMode: (val: boolean) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  execCommand: (cmd: string, val?: string) => void;
}

export function ProductDescriptionEditor({
  description,
  setDescription,
  isHtmlMode,
  setIsHtmlMode,
  editorRef,
  execCommand,
}: ProductDescriptionEditorProps) {
  return (
    <div>
      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Description</label>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-[#16162a] shadow-xs">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 p-1.5 bg-gray-50 dark:bg-[#1f1f3a] gap-1.5 select-none">
          <div className="flex flex-wrap items-center gap-0.5">
            {!isHtmlMode ? (
              <>
                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('underline')}
                  className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>

                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<h2>')}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<h3>')}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<p>')}
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Normal Paragraph"
                >
                  Normal
                </button>

                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('insertOrderedList')}
                  className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </button>

                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('removeFormat')}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-red-500 transition-colors"
                  title="Clear Formatting"
                >
                  Clear Format
                </button>
              </>
            ) : (
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-1.5 py-0.5">HTML Code View</span>
            )}
          </div>

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-700 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-[#2c2c4d] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            {isHtmlMode ? (
              <>
                <Eye className="h-3 w-3" />
                <span>Visual Editor</span>
              </>
            ) : (
              <>
                <Code className="h-3 w-3" />
                <span>HTML View</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Content Area */}
        {isHtmlMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none transition-all resize-y border-0 min-h-[150px]"
            placeholder="<p>Write raw HTML here...</p>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => setDescription(e.currentTarget.innerHTML)}
            onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
            className="w-full bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-semibold focus:outline-none transition-all overflow-y-auto min-h-[150px] prose dark:prose-invert max-w-none border-0"
            style={{ outline: 'none' }}
          />
        )}
      </div>
    </div>
  );
}
