'use client';

import React from 'react';
import { X, Loader2 } from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

import { OrderCreateProductsSection } from './order-create/OrderCreateProductsSection';
import { OrderCreateCustomerSection } from './order-create/OrderCreateCustomerSection';
import { OrderCreatePaymentSection } from './order-create/OrderCreatePaymentSection';
import { useOrderCreateCanvasState } from './order-create/hooks/useOrderCreateCanvasState';

interface OrderCreateCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (newOrder: Order) => void;
  settings: StoreSettings;
}

export default function OrderCreateCanvas({ isOpen, onClose, onOrderCreated, settings }: OrderCreateCanvasProps) {
  const c = useOrderCreateCanvasState({ isOpen, onClose, onOrderCreated, settings });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-[#16162a] shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-slide-in-right">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#111124]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Create New Order</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manually draft and record a custom order for a customer</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={c.handleCreateOrderSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <OrderCreateProductsSection
              isAddingCustom={c.isAddingCustom}
              setIsAddingCustom={c.setIsAddingCustom}
              customItemName={c.customItemName}
              setCustomItemName={c.setCustomItemName}
              customItemPrice={c.customItemPrice}
              setCustomItemPrice={c.setCustomItemPrice}
              customItemQuantity={c.customItemQuantity}
              setCustomItemQuantity={c.setCustomItemQuantity}
              handleAddCustomItem={c.handleAddCustomItem}
              searchQuery={c.searchQuery}
              setSearchQuery={c.setSearchQuery}
              isDropdownOpen={c.isDropdownOpen}
              setIsDropdownOpen={c.setIsDropdownOpen}
              dropdownRef={c.dropdownRef}
              isLoadingProducts={c.isLoadingProducts}
              filteredProducts={c.filteredProducts}
              handleProductSelect={c.handleProductSelect}
              selectedProduct={c.selectedProduct}
              setSelectedProduct={c.setSelectedProduct}
              chosenSize={c.chosenSize}
              setChosenSize={c.setChosenSize}
              chosenColor={c.chosenColor}
              setChosenColor={c.setChosenColor}
              setChosenVariantId={c.setChosenVariantId}
              customUnitPrice={c.customUnitPrice}
              setCustomUnitPrice={c.setCustomUnitPrice}
              chosenQuantity={c.chosenQuantity}
              setChosenQuantity={c.setChosenQuantity}
              handleAddItem={c.handleAddItem}
              selectedItems={c.selectedItems}
              handleRemoveItem={c.handleRemoveItem}
              settings={settings}
            />

            <OrderCreateCustomerSection
              customerSearchQuery={c.customerSearchQuery}
              setCustomerSearchQuery={c.setCustomerSearchQuery}
              searchCustomer={c.searchCustomer}
              isCustomerDropdownOpen={c.isCustomerDropdownOpen}
              setIsCustomerDropdownOpen={c.setIsCustomerDropdownOpen}
              customerResults={c.customerResults}
              isSearchingCustomer={c.isSearchingCustomer}
              handleCustomerSelect={c.handleCustomerSelect}
              customerName={c.customerName}
              setCustomerName={c.setCustomerName}
              customerPhone={c.customerPhone}
              setCustomerPhone={c.setCustomerPhone}
              customerAddress={c.customerAddress}
              setCustomerAddress={c.setCustomerAddress}
              customerCity={c.customerCity}
              setCustomerCity={c.setCustomerCity}
            />

            <OrderCreatePaymentSection
              paymentMethod={c.paymentMethod}
              setPaymentMethod={c.setPaymentMethod}
              paymentMethods={c.paymentMethods}
              shippingFee={c.shippingFee}
              setShippingFee={c.setShippingFee}
              discountAmount={c.discountAmount}
              setDiscountAmount={c.setDiscountAmount}
              staffNotes={c.staffNotes}
              setStaffNotes={c.setStaffNotes}
            />
          </form>

          {/* Footer Bar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#111124] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Payable</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatPrice(c.grandTotal, settings.currencySymbol)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={c.handleCreateOrderSubmit}
                disabled={c.isSaving || c.selectedItems.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {c.isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <span>Create Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
