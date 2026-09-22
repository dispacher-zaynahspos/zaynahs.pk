'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/lib/types';
import { updateSettings } from '@/lib/services/settings';
import { toast } from 'sonner';
import { Loader2, Save, Truck } from '@/components/common/Icons';
import { SettingsTabBar } from './settings-form/SettingsTabBar';
import {
  MerchantAddress,
  PostExApiSettings,
  PostExAddressesConfig,
  PostExSyncRules,
  PostExParcelDefaults,
  PostExWhatsAppConfig,
} from './courier-manager';

interface CourierManagerProps {
  settings: StoreSettings;
}

export default function CourierManager({ settings: initialSettings }: CourierManagerProps) {
  const [enabled, setEnabled] = useState(initialSettings.postex_enabled ?? false);
  const [apiToken, setApiToken] = useState(initialSettings.postex_api_token || '');
  const [mode, setMode] = useState(initialSettings.postex_mode || 'sandbox');
  const [pickupCode, setPickupCode] = useState(initialSettings.postex_pickup_address || '');
  const [returnCode, setReturnCode] = useState(initialSettings.postex_return_address || '');
  const [pickupDisplay, setPickupDisplay] = useState(initialSettings.postex_pickup_display || '');
  const [returnDisplay, setReturnDisplay] = useState(initialSettings.postex_return_display || '');
  const [returnCity, setReturnCity] = useState(initialSettings.postex_return_city || '');
  const [orderType, setOrderType] = useState(initialSettings.postex_order_type || 'Normal');
  const [handlingType, setHandlingType] = useState(initialSettings.postex_handling_type || 'No');
  const [defaultWeight, setDefaultWeight] = useState(initialSettings.postex_default_weight || '0.5');
  const [defaultItems, setDefaultItems] = useState(initialSettings.postex_default_items || '3');
  const [defaultProduct, setDefaultProduct] = useState(initialSettings.postex_default_product || 'Kids Clothes');
  const [defaultRemarks, setDefaultRemarks] = useState(initialSettings.postex_default_remarks || 'Call before delivery, customer is a serious buyer');
  const [productCheck, setProductCheck] = useState(initialSettings.postex_product_check || '1');
  const [skuCheck, setSkuCheck] = useState(initialSettings.postex_sku_check || '0');
  const [weightCheck, setWeightCheck] = useState(initialSettings.postex_weight_check || '1');
  const [piecesCheck, setPiecesCheck] = useState(initialSettings.postex_pieces_check || '1');
  const [codCheck, setCodCheck] = useState(initialSettings.postex_cod_check || '0');
  const [notesCheck, setNotesCheck] = useState(initialSettings.postex_notes_check || '1');
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    initialSettings.postex_whatsapp_template || 'Dear {name}, your order has been booked. You can track it here: {url}\n{note}'
  );
  const [whatsappNote, setWhatsappNote] = useState(initialSettings.postex_whatsapp_note || 'Thank you for shopping with us!');
  const [autoDownloadLabel, setAutoDownloadLabel] = useState(initialSettings.postex_auto_download_label ?? false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [addresses, setAddresses] = useState<MerchantAddress[]>([]);
  const [orderTypes, setOrderTypes] = useState<string[]>([]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        postex_enabled: enabled,
        postex_api_token: apiToken,
        postex_mode: mode,
        postex_pickup_address: pickupCode,
        postex_return_address: returnCode,
        postex_pickup_display: pickupDisplay,
        postex_return_display: returnDisplay,
        postex_return_city: returnCity,
        postex_order_type: orderType,
        postex_handling_type: handlingType,
        postex_default_remarks: defaultRemarks,
        postex_product_check: productCheck,
        postex_sku_check: skuCheck,
        postex_weight_check: weightCheck,
        postex_pieces_check: piecesCheck,
        postex_cod_check: codCheck,
        postex_notes_check: notesCheck,
        postex_default_weight: defaultWeight,
        postex_default_items: defaultItems,
        postex_default_product: defaultProduct,
        postex_whatsapp_template: whatsappTemplate,
        postex_whatsapp_note: whatsappNote,
        postex_auto_download_label: autoDownloadLabel,
      });
      toast.success('Courier settings saved successfully');
    } catch {
      toast.error('Failed to save courier settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLoad = async () => {
    if (!apiToken) {
      setTestResult({ ok: false, message: 'Please enter a PostEx token first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/courier/postex/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: apiToken, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({ ok: false, message: data.error || 'Connection failed.' });
        return;
      }
      setTestResult({
        ok: true,
        message: `Connected! Merchant: ${data.merchantName || 'Verified'} | ${data.addressCount ?? 0} addresses found.`,
      });
      if (Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
      if (Array.isArray(data.orderTypes)) {
        setOrderTypes(data.orderTypes);
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || 'Network error.' });
    } finally {
      setTesting(false);
    }
  };

  const pickupAddresses = addresses.filter(a => a.addressType !== 'Return Address');
  const returnAddresses = addresses;

  const handlePickupChange = (code: string) => {
    setPickupCode(code);
    const selected = pickupAddresses.find(a => a.addressCode === code);
    setPickupDisplay(selected ? `${selected.address} — ${selected.cityName}` : '');
  };

  const handleReturnChange = (code: string) => {
    setReturnCode(code);
    const selected = returnAddresses.find(a => a.addressCode === code);
    if (selected) {
      setReturnCity((selected.cityName || '').toUpperCase());
      setReturnDisplay(`${selected.address} — ${selected.cityName}`);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-[var(--color-primary,#C2185B)]" />
            Courier Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Configure PostEx courier integration, automated booking, and tracking notifications
          </p>
        </div>
      </div>

      {/* 🌟 Unified Top Navigation Tab Bar */}
      <SettingsTabBar activeTab="courier" />

      {/* Responsive 2-Column SaaS Grid (Zero dead space on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: API & Addresses (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* PostEx API & Status Card */}
          <div className="w-full bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                <h2 className="text-sm font-black text-gray-900 dark:text-white">PostEx Courier Settings</h2>
              </div>
              <a
                href="https://merchant.postex.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-primary,#C2185B)] hover:underline font-bold"
              >
                Merchant Portal →
              </a>
            </div>

            <PostExApiSettings
              enabled={enabled}
              setEnabled={setEnabled}
              apiToken={apiToken}
              setApiToken={setApiToken}
              mode={mode}
              setMode={setMode}
              testing={testing}
              testResult={testResult}
              onTestLoad={handleTestLoad}
            />
          </div>

          {/* Pickup & Return Addresses Card */}
          <div className="w-full bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-4 sm:p-5">
            <PostExAddressesConfig
              pickupAddresses={pickupAddresses}
              returnAddresses={returnAddresses}
              pickupCode={pickupCode}
              setPickupCode={setPickupCode}
              returnCode={returnCode}
              setReturnCode={setReturnCode}
              returnCity={returnCity}
              setReturnCity={setReturnCity}
              orderType={orderType}
              setOrderType={setOrderType}
              orderTypes={orderTypes}
              handlingType={handlingType}
              setHandlingType={setHandlingType}
              onPickupChange={handlePickupChange}
              onReturnChange={handleReturnChange}
            />
          </div>
        </div>

        {/* Right Column: Sync Rules, Parcel Defaults & WhatsApp (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Sync & Automation Rules Card */}
          <div className="w-full bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-4 sm:p-5">
            <PostExSyncRules
              productCheck={productCheck}
              setProductCheck={setProductCheck}
              skuCheck={skuCheck}
              setSkuCheck={setSkuCheck}
              weightCheck={weightCheck}
              setWeightCheck={setWeightCheck}
              piecesCheck={piecesCheck}
              setPiecesCheck={setPiecesCheck}
              codCheck={codCheck}
              setCodCheck={setCodCheck}
              notesCheck={notesCheck}
              setNotesCheck={setNotesCheck}
              autoDownloadLabel={autoDownloadLabel}
              setAutoDownloadLabel={setAutoDownloadLabel}
            />
          </div>

          {/* Parcel Defaults Card */}
          <div className="w-full bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-4 sm:p-5">
            <PostExParcelDefaults
              defaultWeight={defaultWeight}
              setDefaultWeight={setDefaultWeight}
              defaultItems={defaultItems}
              setDefaultItems={setDefaultItems}
              defaultProduct={defaultProduct}
              setDefaultProduct={setDefaultProduct}
              defaultRemarks={defaultRemarks}
              setDefaultRemarks={setDefaultRemarks}
            />
          </div>

          {/* WhatsApp Notification Card */}
          <div className="w-full bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-4 sm:p-5">
            <PostExWhatsAppConfig
              whatsappTemplate={whatsappTemplate}
              setWhatsappTemplate={setWhatsappTemplate}
              whatsappNote={whatsappNote}
              setWhatsappNote={setWhatsappNote}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-3 z-30 flex items-center justify-between gap-3 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-xl px-4 py-2.5 shadow-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold hidden sm:block">
          Changes apply to: <span className="text-[var(--color-primary,#C2185B)] font-black">Courier Manager</span>
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
          className="ml-auto flex items-center justify-center gap-2 rounded-lg text-white px-5 h-8.5 text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-white" />}
          <span>Save Courier Settings</span>
        </button>
      </div>
    </div>
  );
}
