'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Link as LinkIcon, 
  Palette, 
  Highlighter, 
  Quote, 
  Code, 
  Eye, 
  Undo, 
  RotateCw,
  Minus,
  Unlink
} from '@/components/common/Icons';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

const TEXT_COLORS = [
  { name: 'Default Dark', value: '#111827' },
  { name: 'Muted Gray', value: '#6b7280' },
  { name: 'Brand Accent', value: '#e94560' },
  { name: 'Primary Red', value: '#dc2626' },
  { name: 'Vibrant Orange', value: '#ea580c' },
  { name: 'Amber Gold', value: '#d97706' },
  { name: 'Emerald Green', value: '#16a34a' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose Pink', value: '#db2777' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bae6fd' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Lavender', value: '#e9d5ff' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = '220px',
  editorRef: externalEditorRef,
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [customColor, setCustomColor] = useState('#111827');
  
  const localEditorRef = useRef<HTMLDivElement>(null);
  const editorRef = externalEditorRef || localEditorRef;
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const highlightMenuRef = useRef<HTMLDivElement>(null);

  // Sync value to contentEditable div initially or on external change,
  // avoiding infinite loops or cursor jump during active typing
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isHtmlMode, editorRef]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
        setShowColorMenu(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(target)) {
        setShowHighlightMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const execCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleApplyColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorMenu(false);
  };

  const handleApplyHighlight = (color: string) => {
    try {
      document.execCommand('hiliteColor', false, color);
    } catch {
      document.execCommand('backColor', false, color);
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setShowHighlightMenu(false);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://example.com):');
    if (url && url.trim()) {
      const normalizedUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://') 
        ? url.trim() 
        : `https://${url.trim()}`;
      execCommand('createLink', normalizedUrl);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 overflow-hidden mt-1.5 transition-colors">
      {/* Formatting Toolbar - Solid neutral background resistant to theme color clashes */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-[#1a1a2e] transition-colors gap-1.5 flex-wrap">
        
        <div className="flex items-center gap-1 flex-wrap">
          {!isHtmlMode ? (
            <>
              {/* History / Undo & Redo */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('undo')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('redo')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Headings & Paragraph - High-contrast pills */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('formatBlock', '<h1>')}
                className="px-2 py-1 rounded-md text-[11px] font-black bg-white dark:bg-[#22223d] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[var(--color-primary,#e94560)] hover:text-[var(--color-primary,#e94560)] shadow-2xs transition-all cursor-pointer"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('formatBlock', '<h2>')}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-white dark:bg-[#22223d] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[var(--color-primary,#e94560)] hover:text-[var(--color-primary,#e94560)] shadow-2xs transition-all cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('formatBlock', '<h3>')}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-white dark:bg-[#22223d] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[var(--color-primary,#e94560)] hover:text-[var(--color-primary,#e94560)] shadow-2xs transition-all cursor-pointer"
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('formatBlock', '<p>')}
                className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white dark:bg-[#22223d] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[var(--color-primary,#e94560)] hover:text-[var(--color-primary,#e94560)] shadow-2xs transition-all cursor-pointer"
                title="Normal Paragraph"
              >
                Normal
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Text Styles: Bold, Italic, Underline, Strikethrough, Code */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('bold')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('italic')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('underline')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('strikeThrough')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Text Color Picker Tool */}
              <div className="relative" ref={colorMenuRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowColorMenu(!showColorMenu);
                    setShowHighlightMenu(false);
                  }}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    showColorMenu 
                      ? 'bg-rose-50 text-[#e94560] dark:bg-[#e94560]/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560]'
                  }`}
                  title="Text Color on Selection"
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Color</span>
                </button>

                {showColorMenu && (
                  <div className="absolute top-full left-0 mt-1 z-50 p-2.5 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-xl space-y-2 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Text Color Palette
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TEXT_COLORS.map(({ name, value: colorVal }) => (
                        <button
                          key={colorVal}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleApplyColor(colorVal)}
                          title={name}
                          className="h-6 w-6 rounded-md border border-gray-300 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                          style={{ backgroundColor: colorVal }}
                        />
                      ))}
                    </div>
                    {/* Custom Hex Color Picker */}
                    <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-6 w-6 rounded border border-gray-200 dark:border-gray-700 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleApplyColor(customColor)}
                        className="flex-1 py-0.5 px-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-[#e94560] hover:text-white text-[10px] font-bold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer text-center"
                      >
                        Apply Hex
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Highlight Marker Tool */}
              <div className="relative" ref={highlightMenuRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowHighlightMenu(!showHighlightMenu);
                    setShowColorMenu(false);
                  }}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    showHighlightMenu 
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560]'
                  }`}
                  title="Highlight Marker on Selection"
                >
                  <Highlighter className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Highlight</span>
                </button>

                {showHighlightMenu && (
                  <div className="absolute top-full left-0 mt-1 z-50 p-2.5 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-xl space-y-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Highlight Colors
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {HIGHLIGHT_COLORS.map(({ name, value: hlColor }) => (
                        <button
                          key={name}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleApplyHighlight(hlColor)}
                          title={name}
                          className={`h-6 w-6 rounded-md border border-gray-300 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center justify-center text-[8px] font-bold ${
                            hlColor === 'transparent' ? 'text-gray-400 bg-white dark:bg-gray-900' : ''
                          }`}
                          style={{ backgroundColor: hlColor }}
                        >
                          {hlColor === 'transparent' ? '✕' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Alignments */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('justifyLeft')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('justifyCenter')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Align Center"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('justifyRight')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Align Right"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('justifyFull')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Justify"
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Lists, Quote & Divider */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('insertUnorderedList')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('insertOrderedList')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('formatBlock', '<blockquote>')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Blockquote"
              >
                <Quote className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('insertHorizontalRule')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Insert Divider Line"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 shrink-0" />

              {/* Insert Link & Remove Link */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleInsertLink}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-2xs"
                title="Insert Link"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('unlink')}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#262646] hover:text-red-500 transition-all cursor-pointer shadow-2xs"
                title="Remove Link"
              >
                <Unlink className="h-3.5 w-3.5" />
              </button>

              {/* Clear Formatting - High-contrast badge */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand('removeFormat')}
                className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-2xs transition-all cursor-pointer shrink-0 ml-1 active:scale-95"
                title="Clear Formatting"
              >
                Clear Format
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 px-2 py-1">
              HTML Code View
            </span>
          )}
        </div>

        {/* Mode Toggle Button: Visual vs Raw HTML */}
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#202038] border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2c2c4d] hover:border-[var(--color-primary,#e94560)] hover:text-[var(--color-primary,#e94560)] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          {isHtmlMode ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Visual Editor</span>
            </>
          ) : (
            <>
              <Code className="h-3.5 w-3.5" />
              <span>HTML View</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="bg-white dark:bg-[#16162a]">
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            style={{ minHeight }}
            className="w-full bg-white dark:bg-[#16162a] px-4 py-3 text-sm font-mono text-gray-800 dark:text-gray-100 focus:outline-none transition-all resize-y border-0"
            placeholder={placeholder || 'Write raw HTML here...'}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            onBlur={(e) => onChange(e.currentTarget.innerHTML)}
            style={{ minHeight, outline: 'none' }}
            className="w-full bg-white dark:bg-[#16162a] px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none transition-all overflow-y-auto prose dark:prose-invert max-w-none border-0"
          />
        )}
      </div>
    </div>
  );
}
