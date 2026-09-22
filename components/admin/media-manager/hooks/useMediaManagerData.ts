'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

import { useMediaUsage } from './useMediaUsage';
import { useMediaAI } from './useMediaAI';
import { useMediaActions } from './useMediaActions';

export interface MediaItem {
  id: string;
  original_filename: string;
  seo_filename: string;
  file_url: string;
  alt_text: string;
  title: string;
  description: string;
  caption: string;
  ai_generated: boolean;
  ai_enabled: boolean;
  bucket: string;
  created_at: string;
  file_size?: number;
  mime_type?: string;
}

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

export const normalizeUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname).toLowerCase();
  } catch {
    return decodeURIComponent(url).toLowerCase();
  }
};

interface UseMediaManagerDataProps {
  mode: 'library' | 'selector';
  multiple?: boolean;
  onSelect?: (urls: string[]) => void;
  onClose?: () => void;
}

export function useMediaManagerData({ mode, multiple, onSelect, onClose }: UseMediaManagerDataProps) {
  const { confirm } = useConfirm();
  const mediaUsage = useMediaUsage();
  const mediaAi = useMediaAI();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [deletedBytes, setDeletedBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiFilter, setAiFilter] = useState<'all' | 'generated' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size-desc' | 'size-asc'>('newest');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last_7' | 'last_30'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [onlyUnused, setOnlyUnused] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<Set<string>>(new Set());

  const [cleanerUsedSelected, setCleanerUsedSelected] = useState<Set<string>>(new Set());
  const [cleanerUnusedSelected, setCleanerUnusedSelected] = useState<Set<string>>(new Set());
  const [cleanerSearch, setCleanerSearch] = useState('');
  const [cleanerTypeFilter, setCleanerTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [uploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [pendingVideoUpload, setPendingVideoUpload] = useState<{ task: UploadTask; file: File } | null>(null);

  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isSavingSortOrder, setIsSavingSortOrder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase.from('media_library').select('*').is('deleted_at', null);

      if (search.trim()) {
        query = query.ilike('original_filename', `%${search}%`);
      }
      if (aiFilter === 'generated') {
        query = query.eq('ai_generated', true);
      } else if (aiFilter === 'pending') {
        query = query.eq('ai_generated', false);
      }
      if (typeFilter === 'image') {
        query = query.like('mime_type', 'image/%');
      } else if (typeFilter === 'video') {
        query = query.like('mime_type', 'video/%');
      }
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'oldest') query = query.order('created_at', { ascending: true });
      else if (sortBy === 'size-desc') query = query.order('file_size', { ascending: false });
      else if (sortBy === 'size-asc') query = query.order('file_size', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      setMedia(data || []);

      const { data: deletedData } = await supabase
        .from('media_library')
        .select('file_size')
        .not('deleted_at', 'is', null);
      const totalDeletedBytes = (deletedData || []).reduce((sum, item) => sum + (item.file_size || 0), 0);
      setDeletedBytes(totalDeletedBytes);
    } catch (err: any) {
      console.error('[Media Manager] Load error:', err);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const mediaActions = useMediaActions(fetchMedia, mediaUsage.loadUsageCrossReferences);

  useEffect(() => {
    fetchMedia();
    mediaUsage.loadUsageCrossReferences();
    if (mode === 'library') {
      mediaAi.fetchAiSettings();
    }
  }, [search, aiFilter, sortBy, typeFilter]);

  const applyDateFilter = (items: MediaItem[]) => {
    if (dateFilter === 'all') return items;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return items.filter(item => {
      const d = new Date(item.created_at);
      if (dateFilter === 'today') return d >= today;
      if (dateFilter === 'yesterday') {
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        return d >= yesterday && d < today;
      }
      if (dateFilter === 'last_7') {
        const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 7);
        return d >= cutoff;
      }
      if (dateFilter === 'last_30') {
        const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 30);
        return d >= cutoff;
      }
      return true;
    });
  };

  const filteredMedia = applyDateFilter(
    media.filter(item => onlyUnused ? !mediaUsage.isMediaUsed(item) : true)
  );

  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const cleanerFiltered = media.filter(item => {
    if (cleanerSearch.trim() && !item.original_filename.toLowerCase().includes(cleanerSearch.toLowerCase())) return false;
    if (cleanerTypeFilter === 'image') return item.mime_type?.startsWith('image/');
    if (cleanerTypeFilter === 'video') return item.mime_type?.startsWith('video/');
    return true;
  });

  const cleanerUsed = cleanerFiltered.filter(item => mediaUsage.isMediaUsed(item));
  const cleanerUnused = cleanerFiltered.filter(item => !mediaUsage.isMediaUsed(item));

  const totalCapacityBytes = 1024 * 1024 * 1024;
  const usedBytes = media.reduce((sum, item) => sum + (item.file_size || 0), 0) + deletedBytes;
  const unusedBytes = cleanerUnused.reduce((sum, item) => sum + (item.file_size || 0), 0);
  const usedPercentage = Math.min(100, (usedBytes / totalCapacityBytes) * 100);

  const handleCopyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success('Image URL copied'); };

  const toggleSelect = (item: MediaItem) => {
    if (mode === 'selector') {
      setSelectedLibraryUrls(prev => {
        const next = new Set(prev);
        if (next.has(item.file_url)) next.delete(item.file_url);
        else { if (!multiple) next.clear(); next.add(item.file_url); }
        return next;
      });
    } else {
      setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMedia.length) setSelectedIds([]);
    else setSelectedIds(filteredMedia.map(m => m.id));
  };

  const handleConfirmSelection = () => {
    if (selectedLibraryUrls.size === 0) { toast.warning('Please select at least one item.'); return; }
    if (onSelect) onSelect(Array.from(selectedLibraryUrls));
    if (onClose) onClose();
  };

  const toggleCleanerUsed = (item: MediaItem) => {
    setCleanerUsedSelected(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
  };

  const toggleSelectAllUsed = () => {
    if (cleanerUsedSelected.size === cleanerUsed.length) setCleanerUsedSelected(new Set());
    else setCleanerUsedSelected(new Set(cleanerUsed.map(m => m.id)));
  };

  const toggleCleanerUnused = (item: MediaItem) => {
    setCleanerUnusedSelected(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
  };

  const toggleSelectAllUnused = () => {
    if (cleanerUnusedSelected.size === cleanerUnused.length) setCleanerUnusedSelected(new Set());
    else setCleanerUnusedSelected(new Set(cleanerUnused.map(m => m.id)));
  };

  const handleSaveSortOrder = async (orderedIds: string[]) => {
    setIsSavingSortOrder(true);
    try {
      const supabase = createClient();
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));
      await Promise.all(
        updates.map(({ id, sort_order }) =>
          supabase.from('media_library').update({ sort_order }).eq('id', id)
        )
      );
      toast.success('Sort order saved successfully');
      await fetchMedia();
    } catch {
      toast.error('Failed to save sort order');
    } finally {
      setIsSavingSortOrder(false);
    }
  };

  return {
    media, setMedia,
    loading,
    search, setSearch,
    aiFilter, setAiFilter,
    sortBy, setSortBy,
    typeFilter, setTypeFilter,
    dateFilter, setDateFilter,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    usedNormUrls: mediaUsage.usedNormUrls,
    usageLoading: mediaUsage.usageLoading,
    onlyUnused, setOnlyUnused,
    selectedIds, setSelectedIds,
    selectedLibraryUrls, setSelectedLibraryUrls,
    cleanerUsedSelected, setCleanerUsedSelected,
    cleanerUnusedSelected, setCleanerUnusedSelected,
    cleanerSearch, setCleanerSearch,
    cleanerTypeFilter, setCleanerTypeFilter,
    isDownloadingZip: mediaActions.isDownloadingZip,
    isBulkDeleting: mediaActions.isBulkDeleting,
    uploadTasks, setUploadTasks,
    uploading,
    fileInputRef,
    globalAi: mediaAi.globalAi,
    generatingId: mediaAi.generatingId,
    bulkGenerating: mediaAi.bulkGenerating,
    bulkCompletedIds: mediaAi.bulkCompletedIds,
    bulkFailedIds: mediaAi.bulkFailedIds,
    bulkTotal: mediaAi.bulkTotal,
    visionApiError: mediaAi.visionApiError,
    editingItem, setEditingItem,
    pendingVideoUpload, setPendingVideoUpload,
    previewItem, setPreviewItem,
    isSavingSortOrder,
    isDragging, setIsDragging,
    isMediaUsed: mediaUsage.isMediaUsed,
    filteredMedia,
    paginatedMedia,
    cleanerUsed,
    cleanerUnused,
    usedBytes,
    unusedBytes,
    usedPercentage,
    fetchMedia,
    loadUsageCrossReferences: mediaUsage.loadUsageCrossReferences,
    handleDelete: (id: string, url: string) =>
      mediaActions.handleDelete(id, url, setSelectedIds, setCleanerUnusedSelected, setCleanerUsedSelected),
    handleBulkDeleteUnused: () =>
      mediaActions.handleBulkDeleteUnused(cleanerUnusedSelected, setCleanerUnusedSelected),
    handleBulkDelete: () => mediaActions.handleBulkDelete(selectedIds, setSelectedIds),
    handleCopyUrl,
    downloadAsZip: (ids: Set<string>, name: string) => mediaActions.downloadAsZip(ids, name, media),
    handleSingleGenerate: (item: MediaItem) => mediaAi.handleSingleGenerate(item, fetchMedia),
    handleBulkGenerate: () => mediaAi.handleBulkGenerate(selectedIds, media, fetchMedia, () => setSelectedIds([])),
    toggleSelect,
    toggleSelectAll,
    handleConfirmSelection,
    toggleCleanerUsed,
    toggleSelectAllUsed,
    toggleCleanerUnused,
    toggleSelectAllUnused,
    handleSaveSortOrder
  };
}
