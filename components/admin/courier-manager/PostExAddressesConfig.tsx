import React from 'react';
import { MerchantAddress } from './types';

interface PostExAddressesConfigProps {
  pickupAddresses: MerchantAddress[];
  returnAddresses: MerchantAddress[];
  pickupCode: string;
  setPickupCode: (val: string) => void;
  returnCode: string;
  setReturnCode: (val: string) => void;
  returnCity: string;
  setReturnCity: (val: string) => void;
  orderType: string;
  setOrderType: (val: string) => void;
  orderTypes: string[];
  handlingType: string;
  setHandlingType: (val: string) => void;
  onPickupChange: (code: string) => void;
  onReturnChange: (code: string) => void;
}

export default function PostExAddressesConfig({
  pickupAddresses,
  returnAddresses,
  pickupCode,
  setPickupCode,
  returnCode,
  setReturnCode,
  returnCity,
  setReturnCity,
  orderType,
  setOrderType,
  orderTypes,
  handlingType,
  setHandlingType,
  onPickupChange,
  onReturnChange,
}: PostExAddressesConfigProps) {
  return (
    <div className="space-y-6">
      {/* Pickup Address */}
      {pickupAddresses.length > 0 ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Pickup Address</label>
          <select
            value={pickupCode || ''}
            onChange={(e) => onPickupChange(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-200"
          >
            <option value="">— Select Pickup Address —</option>
            {pickupAddresses.map(a => (
              <option key={a.addressCode} value={a.addressCode}>
                {a.address} — {a.cityName} [Code: {a.addressCode}] ({a.addressType})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Pickup Address Code</label>
          <input
            type="text"
            value={pickupCode || ''}
            onChange={(e) => setPickupCode(e.target.value)}
            placeholder="Address code from PostEx"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Return Address */}
      {returnAddresses.length > 0 ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Return Address</label>
          <select
            value={returnCode || ''}
            onChange={(e) => onReturnChange(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-200"
          >
            <option value="">— Select Return Address —</option>
            {returnAddresses.map(a => (
              <option key={a.addressCode} value={a.addressCode}>
                {a.address} — {a.cityName} [Code: {a.addressCode}] ({a.addressType})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Return Address Code</label>
          <input
            type="text"
            value={returnCode || ''}
            onChange={(e) => setReturnCode(e.target.value)}
            placeholder="Return address code"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Return City */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Return City</label>
        <input
          type="text"
          value={returnCity}
          onChange={(e) => setReturnCity(e.target.value.toUpperCase())}
          placeholder="e.g. KARACHI"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Enter the city name in uppercase. Auto-filled when you select a return address above.</p>
      </div>

      {/* Shipment Type */}
      {orderTypes.length > 0 ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Shipment Type</label>
          <select
            value={orderType || 'Normal'}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-200"
          >
            {orderTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Shipment Type</label>
          <input
            type="text"
            value={orderType || 'Normal'}
            onChange={(e) => setOrderType(e.target.value)}
            placeholder="Normal"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Special Handling */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Special Handling</label>
        <select
          value={handlingType || 'No'}
          onChange={(e) => setHandlingType(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-200"
        >
          <option value="No">Normal (Standard)</option>
          <option value="Yes">Fragile (Careful Handling)</option>
        </select>
      </div>
    </div>
  );
}
