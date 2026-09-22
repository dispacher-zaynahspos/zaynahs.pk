'use client';

import { useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseMediaDragAndDropUploadOptions {
  mode: 'library' | 'selector';
  multiple: boolean;
  setUploadTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setIsDragging: (v: boolean) => void;
  fetchMedia: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useMediaDragAndDropUpload({
  mode,
  multiple,
  setUploadTasks,
  setIsDragging,
  fetchMedia,
  fileInputRef,
}: UseMediaDragAndDropUploadOptions) {
  const dragCounter = useRef(0);

  const executeActualUpload = async (taskId: string, file: File) => {
    try {
      setUploadTasks((prev: any) => prev.map((t: any) => t.id === taskId ? { ...t, status: 'uploading', progress: 50 } : t));
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-images');
      const response = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Upload endpoint failed');
      }
      setUploadTasks((prev: any) => prev.map((t: any) => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t));
      toast.success(`"${file.name}" uploaded successfully!`);
      fetchMedia();
    } catch (err: any) {
      setUploadTasks((prev: any) => prev.map((t: any) => t.id === taskId ? { ...t, status: 'failed', error: err.message || 'Upload failed' } : t));
      toast.error(`"${file.name}" upload failed: ${err.message}`);
    }
  };

  const processUploadedFiles = (files: File[]) => {
    if (!files.length) return;
    if (mode === 'selector' && !multiple && files.length > 1) { toast.warning('Please select only one file.'); return; }
    const newTasks = files.map(file => ({ id: `task_${Date.now()}_${Math.random().toString(36).substring(2)}`, file, progress: 0, status: 'uploading' as const }));
    setUploadTasks((prev: any) => [...prev, ...newTasks]);
    newTasks.forEach(task => executeActualUpload(task.id, task.file));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processUploadedFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processUploadedFiles(files);
    }
  };

  return {
    handleFileUpload,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    processUploadedFiles
  };
}
