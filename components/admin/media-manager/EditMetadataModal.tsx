'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, Sparkles, Loader2 } from '@/components/common/Icons';
import type { MediaItem } from './hooks/useMediaManagerData';

interface EditMetadataModalProps {
  editingItem: MediaItem;
  setEditingItem: React.Dispatch<React.SetStateAction<MediaItem | null>>;
  onSave: (e: React.FormEvent) => Promise<void>;
}

type GenTarget = 'alt' | 'title' | 'both';

const ALT_MAX = 125;

/** Strip markdown fences and parse the vision model's JSON reply. */
function parseVisionJson(raw: string): { alt_text?: string; title?: string } {
  let clean = (raw || '').trim();
  if (clean.includes('```json')) clean = clean.split('```json')[1].split('```')[0].trim();
  else if (clean.includes('```')) clean = clean.split('```')[1].split('```')[0].trim();
  try {
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

export default function EditMetadataModal({
  editingItem,
  setEditingItem,
  onSave,
}: EditMetadataModalProps) {
  const [generating, setGenerating] = useState<GenTarget | null>(null);

  if (typeof document === 'undefined') return null;

  const isImage = !editingItem.mime_type || editingItem.mime_type.startsWith('image/');
  const altLength = (editingItem.alt_text || '').length;

  const buildPrompt = () => {
    const ctx = editingItem.original_filename ? `\nImage filename for context: ${editingItem.original_filename}` : '';
    return `Analyze this product image and return ONLY valid JSON (no markdown, no extra text):
{"alt_text":"...","title":"..."}
Rules:
- alt_text: descriptive, natural, 80-125 characters. Do NOT use "image of"/"picture of"/"photo of" filler and no keyword stuffing. Include the product type, colour, print/embroidery, fabric and set contents (e.g. 3-piece suit) where visible.
- title: short and clean, 40-60 characters, e.g. "Red Printed Lawn Suit with Dupatta".${ctx}`;
  };

  const handleGenerate = async (target: GenTarget) => {
    if (generating) return; // double-click / concurrency guard
    if (!editingItem.file_url) {
      toast.error('No image URL available for this media item.');
      return;
    }
    setGenerating(target);
    try {
      const res = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: editingItem.file_url, prompt: buildPrompt() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Generation failed (${res.status})`);
      }
      const data = await res.json();
      const meta = parseVisionJson(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
      const nextAlt = (meta.alt_text || '').trim();
      const nextTitle = (meta.title || '').trim();

      if (!nextAlt && !nextTitle) throw new Error('AI returned no usable text. Try again.');

      setEditingItem((prev) => {
        if (!prev) return null;
        const updated = { ...prev };
        if ((target === 'alt' || target === 'both') && nextAlt) updated.alt_text = nextAlt;
        if ((target === 'title' || target === 'both') && nextTitle) updated.title = nextTitle;
        return updated;
      });
      toast.success(target === 'both' ? 'Alt text & title generated' : `${target === 'alt' ? 'Alt text' : 'Title'} generated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      toast.error(msg);
    } finally {
      setGenerating(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Edit Image Metadata</h3>
          <button
            type="button"
            onClick={() => setEditingItem(null)}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          {isImage && (
            <button
              type="button"
              onClick={() => handleGenerate('both')}
              disabled={!!generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer min-h-[44px]"
            >
              {generating === 'both' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating === 'both' ? 'Generating…' : 'Generate both with AI'}
            </button>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Alt Text Tag</label>
              {isImage && (
                <button
                  type="button"
                  onClick={() => handleGenerate('alt')}
                  disabled={!!generating}
                  className="flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {generating === 'alt' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate
                </button>
              )}
            </div>
            <input
              type="text"
              value={editingItem.alt_text || ''}
              onChange={(e) =>
                setEditingItem((prev) => (prev ? { ...prev, alt_text: e.target.value } : null))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
            />
            <div className={`text-[10px] font-medium text-right ${altLength > ALT_MAX ? 'text-red-500' : 'text-gray-400'}`}>
              {altLength}/{ALT_MAX}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Title Tag</label>
              {isImage && (
                <button
                  type="button"
                  onClick={() => handleGenerate('title')}
                  disabled={!!generating}
                  className="flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {generating === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate
                </button>
              )}
            </div>
            <input
              type="text"
              value={editingItem.title || ''}
              onChange={(e) =>
                setEditingItem((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-xs cursor-pointer min-h-[38px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[38px]"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
