'use client';

import React from 'react';
import { Order, StoreSettings } from '@/lib/types';
import { Edit } from '@/components/common/Icons';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';

interface OrderCustomerCardProps {
  order: Order;
  settings: StoreSettings;
  isEditingCustomer: boolean;
  setIsEditingCustomer: (editing: boolean) => void;
  editCustomerName: string;
  setEditCustomerName: (val: string) => void;
  editCustomerPhone: string;
  setEditCustomerPhone: (val: string) => void;
  editAddress: string;
  setEditAddress: (val: string) => void;
  editApt: string;
  setEditApt: (val: string) => void;
  editCity: string;
  setEditCity: (val: string) => void;
  editPostal: string;
  setEditPostal: (val: string) => void;
  editContact: string;
  setEditContact: (val: string) => void;
  editPayment: string;
  setEditPayment: (val: string) => void;
  handleSaveCustomer: () => void;
  isUpdating: boolean;
}

export function OrderCustomerCard({
  order,
  settings,
  isEditingCustomer,
  setIsEditingCustomer,
  editCustomerName,
  setEditCustomerName,
  editCustomerPhone,
  setEditCustomerPhone,
  editAddress,
  setEditAddress,
  editApt,
  setEditApt,
  editCity,
  setEditCity,
  editPostal,
  setEditPostal,
  editContact,
  setEditContact,
  editPayment,
  setEditPayment,
  handleSaveCustomer,
  isUpdating
}: OrderCustomerCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="text-[13.5px] font-bold text-gray-900 dark:text-white">Customer</div>
        {!isEditingCustomer ? (
          <button 
            onClick={() => setIsEditingCustomer(true)}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-[#f1f1f1] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Edit Customer"
          >
            <Edit className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button onClick={() => setIsEditingCustomer(false)} className="text-[12px] font-medium text-gray-600 px-1.5 hover:underline">Cancel</button>
            <button onClick={handleSaveCustomer} disabled={isUpdating} className="text-[12px] font-bold text-blue-600 px-1.5 hover:underline">Save</button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {isEditingCustomer ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Name</label>
                <input 
                  type="text"
                  value={editCustomerName}
                  onChange={e => setEditCustomerName(e.target.value)}
                  className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Phone</label>
                <input 
                  type="text"
                  value={editCustomerPhone}
                  onChange={e => setEditCustomerPhone(e.target.value)}
                  className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Address</label>
              <input 
                type="text"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Apt/Suite</label>
              <input 
                type="text"
                value={editApt}
                onChange={e => setEditApt(e.target.value)}
                className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">City</label>
                <input 
                  type="text"
                  value={editCity}
                  onChange={e => setEditCity(e.target.value)}
                  className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Postal Code</label>
                <input 
                  type="text"
                  value={editPostal}
                  onChange={e => setEditPostal(e.target.value)}
                  className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Contact / Email</label>
              <input 
                type="text"
                value={editContact}
                onChange={e => setEditContact(e.target.value)}
                className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1 tracking-wide">Payment Method</label>
              <input 
                type="text"
                value={editPayment}
                onChange={e => setEditPayment(e.target.value)}
                className="w-full text-[13px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-[13px]">
            <div>
              <a className="text-[13.5px] font-semibold text-[#2c6ecb] dark:text-blue-400 cursor-pointer hover:underline decoration-[#2c6ecb]">
                {order.customerName || 'Guest Customer'}
              </a>
              <div className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5">No orders</div>
            </div>
            
            <div>
              <div className="text-[12px] font-semibold text-gray-900 dark:text-white mb-1.5">Contact information</div>
              {order.customerPhone ? (
                <>
                  <span className="text-gray-900 dark:text-white block text-[13px]">
                    {order.customerPhone}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${order.customerPhone.replace(/[\s\-\(\)]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-[12px] font-semibold transition-colors border border-gray-200 dark:border-gray-700"
                      title="Call customer"
                    >
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span className="hidden sm:inline">Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${cleanWhatsAppPhone(order.customerPhone)}?text=${encodeURIComponent(`Hello ${order.customerName || 'Customer'}, we are contacting you regarding your ${settings.storeName || 'order'} ${order.orderNumber} for ${settings.currencySymbol || 'Rs.'}${order.total}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-[12px] font-semibold transition-colors border border-emerald-200 dark:border-emerald-900/50"
                      title={`Message via WhatsApp regarding ${order.orderNumber}`}
                    >
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic">No phone</div>
              )}
              {(() => {
                const notesText = order.notes || '';
                const lines = notesText.split('\n');
                const contactLine = lines.find(l => l.toLowerCase().startsWith('contact:'));
                if (contactLine) {
                  return <div className="text-[#2c6ecb] dark:text-blue-400 hover:underline cursor-pointer block mt-1">{contactLine.substring('contact:'.length).trim()}</div>
                }
                return null;
              })()}
            </div>

            <hr className="border-t border-gray-200 dark:border-gray-800 my-2" />

            <div>
              <div className="text-[12px] font-semibold text-gray-900 dark:text-white mb-1.5">Shipping address</div>
              <div className="text-gray-900 dark:text-white leading-relaxed">
                {order.customerName || 'Guest Customer'}<br/>
                {(() => {
                  const notesText = order.notes || '';
                  const lines = notesText.split('\n');
                  let addr = '', apt = '', city = '', postal = '', coords = '';
                  lines.forEach(line => {
                    const l = line.toLowerCase();
                    if (l.startsWith('address:')) addr = line.substring('address:'.length).trim();
                    if (l.startsWith('apt/suite:')) apt = line.substring('apt/suite:'.length).trim();
                    if (l.startsWith('city:')) city = line.substring('city:'.length).trim();
                    if (l.startsWith('postal:')) postal = line.substring('postal:'.length).trim();
                    if (l.startsWith('coordinates:')) coords = line.substring('coordinates:'.length).trim();
                  });
                  
                  const addrParts = [];
                  if (addr) addrParts.push(addr);
                  if (apt) addrParts.push(apt);
                  
                  const cityParts = [];
                  if (city) cityParts.push(city);
                  if (postal) cityParts.push(postal);
                  
                  return (
                    <>
                      {addrParts.length > 0 && <>{addrParts.join(', ')}<br/></>}
                      {cityParts.length > 0 && <>{cityParts.join(' ')}<br/></>}
                      {coords && (
                        <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">
                          GPS Location: <span className="font-mono bg-gray-50 dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-100 dark:border-gray-700">{coords}</span>
                        </div>
                      )}
                      {!addr && !city && <span className="text-gray-500 italic">No address provided</span>}
                      {(coords || addr || city) && (
                        <a 
                          href={coords ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr} ${city}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12.5px] text-[#2c6ecb] dark:text-blue-400 cursor-pointer hover:underline block mt-1"
                        >
                          View map
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <hr className="border-t border-gray-200 dark:border-gray-800 my-2" />

            <div>
              <div className="text-[12px] font-semibold text-gray-900 dark:text-white mb-1.5">Billing address</div>
              <div className="text-gray-500 dark:text-gray-400">Same as shipping address</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
