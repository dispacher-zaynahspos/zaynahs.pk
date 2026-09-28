'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Check, X, Loader2 } from '@/components/common/Icons';
import { ShippingZone } from '@/lib/types';
import {
  getShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
} from '@/lib/services/shipping-zones';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

/**
 * Self-contained admin manager for city-based shipping zones (Checkout-B shipping engine).
 * Loads/saves via the shipping-zones server actions directly (no settings-form hook threading).
 * When zero zones exist, storefront checkout keeps the legacy flat shipping-method cost.
 */
export default function ShippingZonesCard({ currencySymbol = 'Rs.' }: { currencySymbol?: string }) {
  const { confirm } = useConfirm();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New-zone form
  const [name, setName] = useState('');
  const [citiesText, setCitiesText] = useState('');
  const [cost, setCost] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setZones(await getShippingZones());
    } catch {
      toast.error('Failed to load shipping zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const parseCities = (text: string): string[] =>
    text.split(',').map(c => c.trim()).filter(Boolean);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Zone name is required'); return; }
    const costNum = parseFloat(cost);
    if (Number.isNaN(costNum) || costNum < 0) { toast.error('Enter a valid cost'); return; }
    try {
      setSaving(true);
      const created = await createShippingZone({
        name: name.trim(),
        cities: parseCities(citiesText),
        cost: costNum,
        freeThreshold: freeThreshold.trim() ? parseFloat(freeThreshold) : null,
        estimatedDays: estimatedDays.trim() || undefined,
        isDefault,
      });
      setZones(prev => [...prev, created]);
      setName(''); setCitiesText(''); setCost(''); setFreeThreshold(''); setEstimatedDays(''); setIsDefault(false);
      toast.success('Shipping zone added');
    } catch {
      toast.error('Failed to add zone');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (zone: ShippingZone) => {
    try {
      const updated = await updateShippingZone(zone.id, { active: !zone.active });
      setZones(prev => prev.map(z => z.id === zone.id ? updated : z));
    } catch {
      toast.error('Failed to update zone');
    }
  };

  const handleDelete = async (zone: ShippingZone) => {
    const ok = await confirm({
      title: 'Delete Shipping Zone',
      message: `Delete "${zone.name}"? Cities in this zone will fall back to the default zone or flat shipping cost.`,
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteShippingZone(zone.id);
      setZones(prev => prev.filter(z => z.id !== zone.id));
      toast.success('Zone deleted');
    } catch {
      toast.error('Failed to delete zone');
    }
  };

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#e94560]" />
          City-Based Shipping Zones
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Charge different delivery rates by city. Checkout matches the buyer&apos;s city to a zone;
          if none match, the <strong>default</strong> zone (or flat shipping cost) is used. Leave empty to keep flat rates.
        </p>
      </div>

      {/* Existing zones */}
      {loading ? (
        <div className="animate-pulse h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : zones.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No zones yet — storefront uses flat shipping-method cost.</p>
      ) : (
        <div className="space-y-2">
          {zones.map(zone => (
            <div key={zone.id} className={`rounded-xl border p-3 ${zone.active ? 'border-gray-200 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800/50 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{zone.name}</span>
                    {zone.is_default && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#e94560]/10 text-[#e94560]">Default</span>}
                    <span className="text-sm font-black text-[#e94560]">{currencySymbol} {zone.cost}</span>
                    {zone.free_threshold != null && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Free over {currencySymbol} {zone.free_threshold}</span>
                    )}
                  </div>
                  {zone.cities.length > 0 && (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{zone.cities.join(', ')}</div>
                  )}
                  {zone.estimated_days && <div className="text-[11px] text-gray-400 mt-0.5">{zone.estimated_days}</div>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(zone)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${zone.active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'text-gray-400 hover:text-green-600'}`}
                    title={zone.active ? 'Active (click to disable)' : 'Disabled (click to enable)'}
                  >
                    {zone.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(zone)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete zone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new zone */}
      <form onSubmit={handleAdd} className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Zone name (e.g. Karachi Metro)"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none"
          />
          <input
            type="number" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} placeholder={`Cost (${currencySymbol})`}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none"
          />
        </div>
        <input
          type="text" value={citiesText} onChange={e => setCitiesText(e.target.value)} placeholder="Cities (comma-separated, e.g. Karachi, Hyderabad)"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="number" inputMode="decimal" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} placeholder="Free shipping over (optional)"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none"
          />
          <input
            type="text" value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} placeholder="Est. days (e.g. 2–3 days)"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#e94560]" />
            Default (catch-all) zone
          </label>
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] disabled:bg-gray-300 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Zone
          </button>
        </div>
      </form>
    </div>
  );
}
