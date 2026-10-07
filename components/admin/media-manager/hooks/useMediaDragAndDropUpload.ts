'use client';

import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { UploadTask, UploadStage } from './useMediaManagerData';

interface UseMediaDragAndDropUploadOptions {
  mode: 'library' | 'selector';
  multiple: boolean;
  setUploadTasks: React.Dispatch<React.SetStateAction<UploadTask[]>>;
  setIsDragging: (v: boolean) => void;
  fetchMedia: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** selector mode: called with the final URL so the modal can auto-select it */
  onUploaded?: (url: string) => void;
}

const MAX_PARALLEL = 2;                 // slow-phone friendly
const MAX_BYTES = 25 * 1024 * 1024;     // 25MB hard cap (matches API bodySizeLimit)
const SLOW_MS = 8000;                   // no-progress hint threshold

const patch = (
  setUploadTasks: React.Dispatch<React.SetStateAction<UploadTask[]>>,
  id: string,
  updates: Partial<UploadTask>,
) => setUploadTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

export function useMediaDragAndDropUpload({
  mode,
  multiple,
  setUploadTasks,
  setIsDragging,
  fetchMedia,
  fileInputRef,
  onUploaded,
}: UseMediaDragAndDropUploadOptions) {
  const dragCounter = useRef(0);
  const queueRef = useRef<UploadTask[]>([]);
  const activeRef = useRef(0);

  const validate = (file: File): string | null => {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|tiff?)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);
    if (!isImage && !isVideo) return 'Unsupported file type';
    if (file.size > MAX_BYTES) return `File too large (max ${Math.round(MAX_BYTES / 1024 / 1024)}MB)`;
    return null;
  };

  // Real-progress upload via XMLHttpRequest (built-in — gives upload.onprogress).
  const uploadOne = (task: UploadTask) =>
    new Promise<void>((resolve) => {
      const { id, file } = task;
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);

      patch(setUploadTasks, id, {
        stage: isVideo ? 'uploading' : 'optimizing',
        status: 'uploading',
        progress: 0,
      });

      const form = new FormData();
      form.append('file', file);
      form.append('bucket', 'product-images');

      const xhr = new XMLHttpRequest();
      patch(setUploadTasks, id, { xhr });

      // Slow-connection watchdog
      let lastLoaded = 0;
      let slowTimer: ReturnType<typeof setTimeout> | null = null;
      const armSlow = () => {
        if (slowTimer) clearTimeout(slowTimer);
        slowTimer = setTimeout(() => patch(setUploadTasks, id, { slow: true }), SLOW_MS);
      };
      armSlow();

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        if (e.loaded !== lastLoaded) { lastLoaded = e.loaded; armSlow(); patch(setUploadTasks, id, { slow: false }); }
        // Transfer phase; server converts to WebP after receiving.
        patch(setUploadTasks, id, { stage: 'uploading', progress: pct });
        if (pct >= 100) patch(setUploadTasks, id, { stage: 'saving' });
      };

      xhr.onload = () => {
        if (slowTimer) clearTimeout(slowTimer);
        if (xhr.status >= 200 && xhr.status < 300) {
          let resUrl = '';
          let sizeAfter: number | undefined;
          try {
            const json = JSON.parse(xhr.responseText);
            resUrl = json.url || json.file_url || '';
            sizeAfter = json.sizeKb ? json.sizeKb * 1024 : (json.size || undefined);
          } catch { /* ignore */ }
          patch(setUploadTasks, id, {
            status: 'completed', stage: 'completed', progress: 100,
            resultUrl: resUrl, sizeAfter, slow: false, xhr: undefined,
          });
          if (mode === 'selector' && resUrl) onUploaded?.(resUrl);
          fetchMedia();
        } else {
          let msg = 'Upload failed';
          try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
          patch(setUploadTasks, id, { status: 'failed', stage: 'failed', error: msg, slow: false, xhr: undefined });
          toast.error(`"${file.name}" upload failed: ${msg}`);
        }
        resolve();
      };

      xhr.onerror = () => {
        if (slowTimer) clearTimeout(slowTimer);
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        patch(setUploadTasks, id, {
          status: 'failed', stage: 'failed',
          error: offline ? 'Offline. Reconnect and press Retry.' : 'Network error. Press Retry.',
          slow: false, xhr: undefined,
        });
        resolve();
      };

      xhr.onabort = () => {
        if (slowTimer) clearTimeout(slowTimer);
        patch(setUploadTasks, id, { status: 'cancelled', stage: 'cancelled', slow: false, xhr: undefined });
        resolve();
      };

      xhr.open('POST', '/api/media/upload');
      xhr.send(form);
    });

  const pump = useCallback(() => {
    while (activeRef.current < MAX_PARALLEL && queueRef.current.length > 0) {
      const task = queueRef.current.shift()!;
      activeRef.current += 1;
      uploadOne(task).finally(() => {
        activeRef.current -= 1;
        pump();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enqueue = useCallback((tasks: UploadTask[]) => {
    queueRef.current.push(...tasks);
    pump();
  }, [pump]);

  const processUploadedFiles = (files: File[]) => {
    if (!files.length) return;
    if (mode === 'selector' && !multiple && files.length > 1) {
      toast.warning('Please select only one file.');
      files = files.slice(0, 1);
    }

    const newTasks: UploadTask[] = files.map(file => {
      const err = validate(file);
      const isImage = file.type.startsWith('image/');
      return {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        status: err ? 'failed' : 'uploading',
        stage: err ? 'failed' : 'queued',
        error: err || undefined,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        sizeBefore: file.size,
      };
    });

    setUploadTasks(prev => [...newTasks, ...prev]);         // tiles appear instantly at the start
    enqueue(newTasks.filter(t => t.status !== 'failed'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processUploadedFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  }, [setIsDragging]);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) { dragCounter.current = 0; setIsDragging(false); }
  }, [setIsDragging]);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) processUploadedFiles(files);
  };

  const retryTask = (task: UploadTask) => {
    patch(setUploadTasks, task.id, { status: 'uploading', stage: 'queued', error: undefined, progress: 0 });
    enqueue([{ ...task, status: 'uploading', stage: 'queued', error: undefined, progress: 0 }]);
  };

  const cancelTask = (task: UploadTask) => {
    if (task.xhr) { try { task.xhr.abort(); } catch { /* ignore */ } }
    else patch(setUploadTasks, task.id, { status: 'cancelled', stage: 'cancelled' });
    // remove from pending queue if not started
    queueRef.current = queueRef.current.filter(t => t.id !== task.id);
  };

  return {
    handleFileUpload,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    processUploadedFiles,
    retryTask,
    cancelTask,
  };
}
