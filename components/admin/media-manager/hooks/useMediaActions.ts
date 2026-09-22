'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';
import JSZip from 'jszip';
import type { MediaItem } from './useMediaManagerData';

export function useMediaActions(
  fetchMedia: () => Promise<void>,
  loadUsageCrossReferences: () => Promise<void>
) {
  const { confirm } = useConfirm();
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleDelete = async (
    id: string,
    url: string,
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
    setCleanerUnusedSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
    setCleanerUsedSelected: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this media file to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('media_library')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (dbError) throw dbError;

      toast.success('Media file moved to Trash');
      fetchMedia();
      loadUsageCrossReferences();
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      setCleanerUnusedSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      setCleanerUsedSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err: any) {
      logDbError(
        {
          file: 'components/admin/MediaManager.tsx',
          functionName: 'handleDelete',
          table: 'media_library',
          action: 'UPDATE',
        },
        err
      );
      toast.error(`Failed to move to Trash: ${err?.message || err}`);
    }
  };

  const handleBulkDeleteUnused = async (
    cleanerUnusedSelected: Set<string>,
    setCleanerUnusedSelected: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    if (cleanerUnusedSelected.size === 0) {
      toast.warning('No unused files selected.');
      return;
    }
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: `Move ${cleanerUnusedSelected.size} unused file(s) to Trash?`,
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    try {
      setIsBulkDeleting(true);
      const toastId = toast.loading(`Moving ${cleanerUnusedSelected.size} file(s) to Trash...`);
      const supabase = createClient();
      const idsToDelete = Array.from(cleanerUnusedSelected);
      const { error: dbError } = await supabase
        .from('media_library')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', idsToDelete);
      if (dbError) throw dbError;

      toast.success(`${idsToDelete.length} file(s) moved to Trash.`, { id: toastId });
      setCleanerUnusedSelected(new Set());
      fetchMedia();
      loadUsageCrossReferences();
    } catch (err: any) {
      logDbError(
        {
          file: 'components/admin/MediaManager.tsx',
          functionName: 'handleBulkDeleteUnused',
          table: 'media_library',
          action: 'UPDATE',
        },
        err
      );
      toast.error(`Bulk move to Trash failed: ${err?.message || err}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDelete = async (
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedIds.length === 0) {
      toast.warning('No files selected.');
      return;
    }
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: `Move ${selectedIds.length} file(s) to Trash?`,
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    try {
      setIsBulkDeleting(true);
      const toastId = toast.loading(`Moving ${selectedIds.length} file(s) to Trash...`);
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('media_library')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', selectedIds);
      if (dbError) throw dbError;

      toast.success(`${selectedIds.length} file(s) moved to Trash.`, { id: toastId });
      setSelectedIds([]);
      fetchMedia();
      loadUsageCrossReferences();
    } catch (err: any) {
      logDbError(
        {
          file: 'components/admin/MediaManager.tsx',
          functionName: 'handleBulkDelete',
          table: 'media_library',
          action: 'UPDATE',
        },
        err
      );
      toast.error(`Bulk move to Trash failed: ${err?.message || err}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const downloadAsZip = async (ids: Set<string>, zipName: string, media: MediaItem[]) => {
    if (ids.size === 0) {
      toast.warning('No files selected to download.');
      return;
    }
    const items = media.filter((m) => ids.has(m.id));
    if (items.length === 0) {
      toast.warning('Selected files not found.');
      return;
    }

    try {
      setIsDownloadingZip(true);
      const toastId = toast.loading(`Preparing ZIP with ${items.length} file(s)...`);

      const zip = new JSZip();
      const folder = zip.folder(zipName) ?? zip;

      await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(item.file_url, { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const filename = item.original_filename || item.file_url.split('/').pop() || item.id;
            folder.file(filename, blob);
          } catch (err) {
            console.warn(`[ZIP] Skipped ${item.original_filename}:`, err);
          }
        })
      );

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${zipName}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${items.length} file(s) as ${zipName}.zip`, { id: toastId });
    } catch (err: any) {
      toast.error(`ZIP download failed: ${err.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return {
    isDownloadingZip,
    isBulkDeleting,
    handleDelete,
    handleBulkDeleteUnused,
    handleBulkDelete,
    downloadAsZip,
  };
}
