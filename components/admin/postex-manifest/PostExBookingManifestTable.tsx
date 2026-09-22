'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Package, ChevronLeft, Upload } from '@/components/common/Icons';
import { usePostExCityFetcher } from '@/hooks/usePostExCityFetcher';
import { EditableRow, PostExBookingManifestTableProps } from './types';
import PostExRowDetailsModal from './PostExRowDetailsModal';
import { PostExDesktopTable } from './PostExDesktopTable';
import { PostExMobileCards } from './PostExMobileCards';

export default function PostExBookingManifestTable({ orders, settings, onGoBack }: PostExBookingManifestTableProps) {
  const router = useRouter();
  const { cities, loading: citiesLoading } = usePostExCityFetcher(settings);
  const [rows, setRows] = useState<Record<string, EditableRow>>({});
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Record<string, { success: boolean; tracking?: string; error?: string }>>({});
  const [selectAll, setSelectAll] = useState(true);
  const [detailRowId, setDetailRowId] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, EditableRow> = {};
    orders.forEach(o => {
      const cleanCity = (o.shippingCity || '').split(',')[0].trim();
      const guessedCity = cleanCity
        || cities.find(c => o.shippingAddress?.toUpperCase().includes(c))
        || '';

      let paymentMethod = 'Cash on delivery';
      const noteLines = (o.notes || '').split('\n');
      noteLines.forEach(line => {
        const lower = line.toLowerCase().trim();
        if (lower.startsWith('payment method:')) {
          const pm = line.substring('payment method:'.length).trim();
          if (pm) paymentMethod = pm;
        }
      });

      const autoPieces = settings.postex_pieces_check === '1';
      const piecesCount = autoPieces
        ? (o.items?.length || 1).toString()
        : (settings.postex_default_items || '1');

      initial[o.id] = {
        selected: true,
        name: o.customerName || '',
        phone: o.customerPhone || '',
        address: o.shippingAddress || '',
        city: guessedCity,
        cod: o.total?.toString() || '0',
        kg: settings.postex_default_weight || '0.5',
        shipmentType: 'Normal',
        fragile: 'No',
        pieces: piecesCount,
        remarks: settings.postex_default_remarks || '',
        invoiceDivision: '1',
        paymentMethod,
        productDetail: settings.postex_default_product || '',
      };
    });
    setRows(initial);
    setSelectAll(true);
  }, [orders, cities, settings]);

  const updateRow = useCallback((id: string, field: keyof EditableRow, value: any) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }, []);

  const toggleSelectAll = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    setRows(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => { next[id] = { ...next[id], selected: newVal }; });
      return next;
    });
  };

  const completedCount = Object.values(results).filter(r => r.success).length;
  const failedCount = Object.values(results).filter(r => !r.success).length;
  const allDone = Object.keys(rows).length > 0 && Object.keys(results).length === Object.keys(rows).length;

  const handleUpload = async () => {
    const selected = Object.entries(rows).filter(([, r]) => r.selected);
    if (selected.length === 0) return;

    setUploading(true);
    const cns: string[] = [];
    for (const [id, row] of selected) {
      try {
        const res = await fetch('/api/courier/postex/fulfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: id,
            customerName: row.name,
            customerPhone: row.phone,
            deliveryAddress: row.address,
            cityName: row.city,
            total: row.cod,
            weight: row.kg,
            packetCount: row.pieces,
            remarks: row.remarks,
            orderType: row.shipmentType,
            productDetail: row.productDetail,
          }),
        });
        const data = await res.json();
        if (data.success && data.trackingNumber) cns.push(data.trackingNumber);
        setResults(prev => ({
          ...prev,
          [id]: { success: data.success, tracking: data.trackingNumber, error: data.error },
        }));
      } catch (err: any) {
        setResults(prev => ({
          ...prev,
          [id]: { success: false, error: err.message },
        }));
      }
    }
    setUploading(false);

    if (settings.postex_auto_download_label && cns.length > 0) {
      window.open(`/api/courier/postex/labels?cns=${cns.join(',')}`, '_blank');
    }
  };

  const activeDetail = detailRowId ? rows[detailRowId] : null;
  const detailOrder = detailRowId ? orders.find(o => o.id === detailRowId) : null;

  const handleDetailSave = (id: string, updates: Partial<EditableRow>) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    setDetailRowId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1e]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">PostEx</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Create Booking with PostEx</p>
            </div>
          </div>
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Go Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Summary bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {Object.keys(rows).length} order{Object.keys(rows).length !== 1 ? 's' : ''} loaded
            </span>
            {completedCount > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                {completedCount} booked
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/50">
                {failedCount} failed
              </span>
            )}
          </div>
          {citiesLoading && (
            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading cities...
            </span>
          )}
        </div>

        {/* Desktop Table View */}
        <PostExDesktopTable
          orders={orders}
          rows={rows}
          results={results}
          selectAll={selectAll}
          toggleSelectAll={toggleSelectAll}
          updateRow={updateRow}
          cities={cities}
          citiesLoading={citiesLoading}
          setDetailRowId={setDetailRowId}
        />

        {/* Mobile Cards View */}
        <PostExMobileCards
          orders={orders}
          rows={rows}
          results={results}
          updateRow={updateRow}
          cities={cities}
          citiesLoading={citiesLoading}
          setDetailRowId={setDetailRowId}
        />

        {/* Bottom actions bar */}
        <div className="sticky bottom-0 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!allDone ? (
              <button
                onClick={handleUpload}
                disabled={uploading || Object.values(rows).filter(r => r.selected).length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto"
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Uploading Bookings...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Upload Booking</>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-5 w-5" />
                All bookings uploaded
              </div>
            )}
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Go Back
            </button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {orders.map(o => {
                const res = results[o.id];
                if (!res) return null;
                return (
                  <span key={o.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    res.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                  }`} title={res.success ? '' : res.error}>
                    {res.success ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    {o.orderNumber}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Row Modal */}
      {detailRowId && activeDetail && detailOrder && (
        <PostExRowDetailsModal
          order={detailOrder}
          row={activeDetail}
          settings={settings}
          onClose={() => setDetailRowId(null)}
          onSave={(updates) => handleDetailSave(detailRowId, updates)}
        />
      )}
    </div>
  );
}
