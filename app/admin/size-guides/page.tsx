'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { SizeGuide } from '@/lib/types';
import {
  getSizeGuides,
  createSizeGuide,
  updateSizeGuide,
  deleteSizeGuide
} from '@/lib/services/sizeGuides';
import { toast } from 'sonner';
import { processImageUrl } from '@/lib/services/storage';
import { SizeGuideFormCard, SavedPresetsCard } from './components';

export default function SizeGuidesPage() {
  const { confirm } = useConfirm();
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Form states
  const [editingGuide, setEditingGuide] = useState<SizeGuide | null>(null);
  const [newName, setNewName] = useState('');
  const [newColumns, setNewColumns] = useState('Size, Chest, Length, Shoulder');
  const [newRows, setNewRows] = useState<Record<string, string>[]>([
    { 'Size': 'S', 'Chest': '38', 'Length': '26', 'Shoulder': '17' },
    { 'Size': 'M', 'Chest': '40', 'Length': '27', 'Shoulder': '18' },
    { 'Size': 'L', 'Chest': '42', 'Length': '28', 'Shoulder': '19' }
  ]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedGuideIds, setSelectedGuideIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getSizeGuides();
      setGuides(data);
    } catch {
      toast.error('Failed to load size guides');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) return toast.error('Guide name required');
    const cols = newColumns.split(',').map(s => s.trim()).filter(Boolean);
    if (cols.length === 0) return toast.error('At least one column required');
    const sanitizedRows = newRows.map(row => {
      const sanitized: Record<string, string> = {};
      cols.forEach(col => { sanitized[col] = row[col] || ''; });
      return sanitized;
    });
    try {
      setSaving(true);
      if (editingGuide) {
        const updated = await updateSizeGuide(editingGuide.id, {
          name: newName.trim(),
          chart_data: sanitizedRows
        });
        setGuides(prev => prev.map(g => g.id === editingGuide.id ? updated : g));
        setEditingGuide(null);
        toast.success('Size guide updated successfully!');
      } else {
        const created = await createSizeGuide({
          name: newName.trim(),
          chart_data: sanitizedRows
        });
        setGuides(prev => [...prev, created]);
        toast.success('Size guide saved!');
      }
      setNewName('');
      setNewColumns('Size, Chest, Length, Shoulder');
      setNewRows([
        { 'Size': 'S', 'Chest': '38', 'Length': '26', 'Shoulder': '17' },
        { 'Size': 'M', 'Chest': '40', 'Length': '27', 'Shoulder': '18' },
        { 'Size': 'L', 'Chest': '42', 'Length': '28', 'Shoulder': '19' }
      ]);
    } catch {
      toast.error(editingGuide ? 'Failed to update guide' : 'Failed to save guide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Size Guide',
      message: 'Delete this size guide preset?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    try {
      await deleteSizeGuide(id);
      setGuides(prev => prev.filter(g => g.id !== id));
      if (editingGuide?.id === id) {
        setEditingGuide(null);
        setNewName('');
        setNewColumns('Size, Chest, Length, Shoulder');
        setNewRows([]);
      }
      toast.success('Size guide deleted');
    } catch {
      toast.error('Failed to delete size guide');
    }
  };

  const handleExportJSON = () => {
    try {
      const toExport = selectedGuideIds.size > 0
        ? guides.filter(g => selectedGuideIds.has(g.id))
        : guides;
      if (toExport.length === 0) return toast.error('No size guides to export');
      const exportData = toExport.map(g => ({
        name: g.name,
        chart_data: g.chart_data,
        imageUrl: g.imageUrl
      }));
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `size-guides-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSelectedGuideIds(new Set());
      toast.success('Size Guides exported successfully.');
    } catch {
      toast.error('Failed to export size guides');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) return toast.error('Invalid format. Must be a JSON array.');
        let imported = 0, updated = 0;
        const newGuides = [...guides];
        for (const item of json) {
          if (!item.name || !Array.isArray(item.chart_data)) continue;
          
          let finalImageUrl = item.imageUrl || null;
          if (finalImageUrl) {
            finalImageUrl = await processImageUrl(finalImageUrl, item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'settings');
          }

          const existing = newGuides.find(g => g.name.toLowerCase() === item.name.toLowerCase());
          if (existing) {
            const updatedGuide = await updateSizeGuide(existing.id, {
              name: item.name,
              chart_data: item.chart_data,
              imageUrl: finalImageUrl || undefined
            });
            const idx = newGuides.findIndex(g => g.id === existing.id);
            if (idx !== -1) newGuides[idx] = updatedGuide;
            updated++;
          } else {
            const created = await createSizeGuide({
              name: item.name,
              chart_data: item.chart_data,
              imageUrl: finalImageUrl || undefined
            });
            newGuides.push(created);
            imported++;
          }
        }
        setGuides(newGuides);
        toast.success(`Import complete: ${imported} created, ${updated} updated.`);
      } catch {
        toast.error('Failed to parse and import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/80 dark:border-gray-800/80 pb-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Size Guides</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create reusable size chart presets and instantly link them to products.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-4">
          <SizeGuideFormCard
            editingGuide={editingGuide}
            newName={newName}
            setNewName={setNewName}
            newColumns={newColumns}
            setNewColumns={setNewColumns}
            newRows={newRows}
            setNewRows={setNewRows}
            saving={saving}
            handleSave={handleSave}
            setEditingGuide={setEditingGuide}
            confirm={confirm}
          />
        </div>

        <div className="lg:col-span-7">
          <SavedPresetsCard
            guides={guides}
            loading={loading}
            selectedGuideIds={selectedGuideIds}
            setSelectedGuideIds={setSelectedGuideIds}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            handleExportJSON={handleExportJSON}
            handleImportJSON={handleImportJSON}
            fileInputRef={fileInputRef}
            setEditingGuide={setEditingGuide}
            setNewName={setNewName}
            setNewColumns={setNewColumns}
            setNewRows={setNewRows}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
