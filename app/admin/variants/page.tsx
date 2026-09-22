'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VariantPreset, VariantPresetValue } from '@/lib/types';
import {
  getVariantPresets,
  createVariantPreset,
  deleteVariantPreset,
  updateVariantPreset
} from '@/lib/services/variantPresets';
import { extractColorsFromName } from '@/lib/utils/swatch';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { VariantPresetFormCard, SavedPresetsCard } from './components';

export default function VariantPresetsPage() {
  const { confirm } = useConfirm();
  const [presets, setPresets] = useState<VariantPreset[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Form states
  const [editingPreset, setEditingPreset] = useState<VariantPreset | null>(null);
  const [newName, setNewName] = useState('');
  const [newAttr, setNewAttr] = useState<VariantPreset['attribute']>('size');
  const [newInput, setNewInput] = useState('');
  const [newValues, setNewValues] = useState<VariantPresetValue[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getVariantPresets();
      setPresets(data);
    } catch {
      toast.error('Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  const addValue = () => {
    const raw = newInput.trim().replace(/,$/, '');
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    parts.forEach(label => {
      if (!newValues.find(v => v.label === label)) {
        const hex = newAttr === 'color' ? (extractColorsFromName(label) || '#888888') : undefined;
        setNewValues(prev => [...prev, { label, hex }]);
      }
    });
    setNewInput('');
  };

  const handleSave = async () => {
    if (!newName.trim()) return toast.error('Preset name required');
    if (newValues.length === 0) return toast.error('Add at least one value');
    try {
      setSaving(true);
      if (editingPreset) {
        const updated = await updateVariantPreset(editingPreset.id, {
          name: newName.trim(),
          attribute: newAttr,
          values: newValues
        });
        setPresets(prev => prev.map(p => p.id === editingPreset.id ? updated : p));
        setEditingPreset(null);
        toast.success('Preset updated successfully!');
      } else {
        const created = await createVariantPreset({ name: newName.trim(), attribute: newAttr, values: newValues });
        setPresets(prev => [...prev, created]);
        toast.success('Preset saved!');
      }
      setNewName('');
      setNewValues([]);
      setNewInput('');
    } catch {
      toast.error(editingPreset ? 'Failed to update preset' : 'Failed to save preset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Preset',
      message: 'Delete this preset?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    try {
      await deleteVariantPreset(id);
      setPresets(prev => prev.filter(p => p.id !== id));
      if (editingPreset?.id === id) {
        setEditingPreset(null);
        setNewName('');
        setNewValues([]);
        setNewInput('');
      }
      toast.success('Preset deleted');
    } catch {
      toast.error('Failed to delete preset');
    }
  };

  const handleExportJSON = () => {
    try {
      const toExport = selectedPresetIds.size > 0
        ? presets.filter(p => selectedPresetIds.has(p.id))
        : presets;
      if (toExport.length === 0) return toast.error('No presets to export');
      const exportData = toExport.map(p => ({
        name: p.name,
        attribute: p.attribute,
        values: p.values
      }));
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `variant-presets-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSelectedPresetIds(new Set());

      toast.success('Variant Presets exported successfully.');
    } catch {
      toast.error('Failed to export presets');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          return toast.error('Invalid file format. Presets must be a JSON array.');
        }

        let importedCount = 0;
        let updatedCount = 0;
        const newPresets = [...presets];

        for (const item of json) {
          if (!item.name || !item.attribute || !Array.isArray(item.values)) {
            continue;
          }

          const validAttrs = ['color', 'size', 'material', 'custom'];
          if (!validAttrs.includes(item.attribute)) continue;

          const existing = newPresets.find(p => p.name.toLowerCase() === item.name.toLowerCase());
          if (existing) {
            const updated = await updateVariantPreset(existing.id, {
              name: item.name,
              attribute: item.attribute,
              values: item.values
            });
            const idx = newPresets.findIndex(p => p.id === existing.id);
            if (idx !== -1) {
              newPresets[idx] = updated;
            }
            updatedCount++;
          } else {
            const created = await createVariantPreset({
              name: item.name,
              attribute: item.attribute,
              values: item.values
            });
            newPresets.push(created);
            importedCount++;
          }
        }

        setPresets(newPresets);
        toast.success(`Import completed: ${importedCount} new created, ${updatedCount} updated.`);
      } catch {
        toast.error('Failed to parse and import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEditPreset = (preset: VariantPreset) => {
    setEditingPreset(preset);
    setNewName(preset.name);
    setNewAttr(preset.attribute);
    setNewValues(preset.values);
    const mainEl = document.getElementById('admin-main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setNewName('');
    setNewAttr('size');
    setNewValues([]);
    setNewInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/80 dark:border-gray-800/80 pb-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Variant Presets</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Save reusable variant sets (sizes, colors, materials) and instantly import them when creating products.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-4">
          <VariantPresetFormCard
            editingPreset={editingPreset}
            newName={newName}
            setNewName={setNewName}
            newAttr={newAttr}
            setNewAttr={setNewAttr}
            newInput={newInput}
            setNewInput={setNewInput}
            newValues={newValues}
            setNewValues={setNewValues}
            addValue={addValue}
            handleSave={handleSave}
            saving={saving}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div className="lg:col-span-7">
          <SavedPresetsCard
            presets={presets}
            loading={loading}
            selectedPresetIds={selectedPresetIds}
            setSelectedPresetIds={setSelectedPresetIds}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            fileInputRef={fileInputRef}
            handleExportJSON={handleExportJSON}
            handleImportJSON={handleImportJSON}
            onEditPreset={handleEditPreset}
            onDeletePreset={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

