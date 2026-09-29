'use client';

import { useState } from 'react';
import { getAutoMediaAi, setAutoMediaAi } from '@/lib/services/ai/ai-settings-client';
import { toast } from 'sonner';
import { MediaItem } from './useMediaManagerData';

export function useMediaAI() {
  const [globalAi, setGlobalAi] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkCompletedIds, setBulkCompletedIds] = useState<string[]>([]);
  const [bulkFailedIds, setBulkFailedIds] = useState<string[]>([]);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [visionApiError, setVisionApiError] = useState<string | null>(null);

  const fetchAiSettings = async () => {
    try {
      const val = await getAutoMediaAi();
      setGlobalAi(val);
    } catch (err) {
      console.warn('[Media Manager] Could not load global AI settings:', err);
    }
  };

  const toggleGlobalAi = async () => {
    const nextVal = !globalAi;
    setGlobalAi(nextVal);
    try {
      await setAutoMediaAi(nextVal);
      toast.success(`Auto vision tags ${nextVal ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setGlobalAi(globalAi);
      toast.error('Failed to save settings');
    }
  };

  const handleSingleGenerate = async (item: MediaItem, onRefresh: () => void) => {
    try {
      setGeneratingId(item.id);
      setVisionApiError(null);
      const response = await fetch('/api/media/ai-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: item.file_url, media_id: item.id })
      });
      const resData = await response.json();
      if (!response.ok) {
        if (response.status >= 500) setVisionApiError(resData.error || 'API key issue — update in Settings');
        throw new Error(resData.error || 'Failed to generate meta');
      }
      toast.success(`AI alt tags written for: ${item.original_filename}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'AI metadata write failed');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBulkGenerate = async (
    selectedIds: string[],
    media: MediaItem[],
    onRefresh: () => void,
    onClearSelection: () => void
  ) => {
    if (!selectedIds.length) return;
    const CONCURRENCY = 3;
    const pendingItems = media.filter(m => selectedIds.includes(m.id) && !m.ai_generated);
    const skippedCount = selectedIds.length - pendingItems.length;
    if (pendingItems.length === 0) {
      toast.info('All selected images are already tagged.');
      return;
    }
    setVisionApiError(null);
    setBulkGenerating(true);
    setBulkTotal(pendingItems.length);
    setBulkCompletedIds([]);
    setBulkFailedIds([]);
    const toastId = toast.loading(`Generating metadata for ${pendingItems.length} files...`);
    let localDone = 0;
    let localFailed = 0;
    try {
      for (let i = 0; i < pendingItems.length; i += CONCURRENCY) {
        const chunk = pendingItems.slice(i, i + CONCURRENCY);
        const processedBefore = i;
        toast.loading(`Processing batch — (${processedBefore}/${pendingItems.length}) done, starting next ${chunk.length}...`, { id: toastId });
        await Promise.allSettled(chunk.map(async (item) => {
          setGeneratingId(item.id);
          try {
            const res = await fetch('/api/media/ai-meta', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_url: item.file_url, media_id: item.id })
            });
            if (!res.ok) throw new Error(await res.text());
            setBulkCompletedIds(prev => [...prev, item.id]);
            localDone++;
          } catch {
            setBulkFailedIds(prev => [...prev, item.id]);
            localFailed++;
          }
        }));
        toast.loading(`Batch complete — (${localDone + localFailed}/${pendingItems.length}) done (${localDone} ok, ${localFailed} failed)`, { id: toastId });
        await new Promise(res => setTimeout(res, 300));
      }
      setGeneratingId(null);
      const msg = skippedCount > 0
        ? `Processed ${localDone} pending images. ${skippedCount} were already tagged.`
        : `Bulk vision metadata complete! (${localDone} succeeded, ${localFailed} failed)`;
      toast.success(msg, { id: toastId });
      onClearSelection();
      onRefresh();
    } catch {
      toast.error('Bulk vision process failed', { id: toastId });
    } finally {
      setBulkGenerating(false);
      setBulkCompletedIds([]);
      setBulkFailedIds([]);
      setBulkTotal(0);
      setGeneratingId(null);
    }
  };

  return {
    globalAi,
    setGlobalAi,
    toggleGlobalAi,
    generatingId,
    bulkGenerating,
    bulkCompletedIds,
    bulkFailedIds,
    bulkTotal,
    visionApiError,
    fetchAiSettings,
    handleSingleGenerate,
    handleBulkGenerate,
  };
}
