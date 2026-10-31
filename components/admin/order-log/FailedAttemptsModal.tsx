'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { FailedOrderAttempt, StoreSettings, CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AlertCircle, CheckCircle2, Copy, Check, MessageSquare, ExternalLink } from '@/components/common/Icons';

interface FailedAttemptsModalProps {
  open: boolean;
  onClose: () => void;
  failedAttempts: FailedOrderAttempt[];
  settings: StoreSettings;
}

export function FailedAttemptsModal({
  open,
  onClose,
  failedAttempts,
  settings,
}: FailedAttemptsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getItemDetails = (item: CartItem) => {
    const name = item.product?.name || (item as unknown as { title?: string }).title || 'Item';
    const variant =
      item.selected_variant?.size ||
      item.selected_variant?.color ||
      (item as unknown as { selectedSize?: string }).selectedSize ||
      '';
    const price = item.total ?? (item.unit_price ? item.unit_price * item.quantity : (item as unknown as { price?: number }).price ?? 0);
    return { name, variant, price };
  };

  const getWhatsAppRecoveryUrl = (attempt: FailedOrderAttempt) => {
    let phone = (attempt.customer_phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('03')) {
      phone = '92' + phone.slice(1);
    }
    const storeName = settings.store_name || 'TotVogue';
    const customerName = attempt.customer_name || 'there';
    const itemsList = (attempt.cart_items || [])
      .map((item) => {
        const { name, variant } = getItemDetails(item);
        return `${item.quantity}x ${name}${variant ? ` (${variant})` : ''}`;
      })
      .join(', ');
    const totalFormatted = formatPrice(attempt.total, settings.currency_symbol);

    const message = `Hello ${customerName}! 👋\nWe noticed your recent order for *${itemsList}* (${totalFormatted}) on *${storeName}* was interrupted at checkout.\n\nWe have your cart saved and ready. Would you like us to confirm and dispatch your order for you?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Failed Checkout Attempts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customers who encountered an issue during checkout. Reach out to recover the sale.
            </p>
          </div>
        </div>
      }
      size="lg"
      variant="sheet"
    >
      <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
        {failedAttempts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              No Failed Checkout Attempts
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              All checkout attempts are processing smoothly with zero failures recorded.
            </p>
          </div>
        ) : (
          failedAttempts.map((attempt) => {
            const dateStr = new Date(attempt.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const shippingAddr = (attempt.shipping_address as Record<string, string>) || {};
            const city = shippingAddr.city || '';
            const address = shippingAddr.address || '';

            return (
              <div
                key={attempt.id}
                className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-[#16162a] shadow-xs space-y-3 hover:border-gray-300 transition-colors"
              >
                {/* Header: Customer info & timestamp */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {attempt.customer_name || 'Guest Customer'}
                      </span>
                      {attempt.customer_phone && (
                        <span className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {attempt.customer_phone}
                        </span>
                      )}
                    </div>
                    {city && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {city} {address ? `• ${address}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-gray-400 block">{dateStr}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(attempt.total, settings.currency_symbol)}
                    </span>
                  </div>
                </div>

                {/* Cart items */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 text-xs space-y-1.5 border border-gray-100 dark:border-gray-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Cart Items ({attempt.cart_items?.length || 0})
                  </span>
                  {(attempt.cart_items || []).map((item, idx) => {
                    const { name, variant, price } = getItemDetails(item);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-gray-800 dark:text-gray-200 truncate">
                          <strong className="font-semibold">{item.quantity}x</strong> {name}
                          {variant ? (
                            <span className="text-gray-500 text-[11px]"> ({variant})</span>
                          ) : null}
                        </span>
                        <span className="font-medium text-gray-600 dark:text-gray-400 shrink-0">
                          {formatPrice(price, settings.currency_symbol)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Error reason */}
                {attempt.error_message && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 px-2.5 py-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30">
                    <span className="font-semibold">Error:</span> {attempt.error_message}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                  {attempt.customer_phone && (
                    <button
                      onClick={() => handleCopyPhone(attempt.id, attempt.customer_phone!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copiedId === attempt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Phone</span>
                        </>
                      )}
                    </button>
                  )}

                  {attempt.customer_phone && (
                    <a
                      href={getWhatsAppRecoveryUrl(attempt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Recover via WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
