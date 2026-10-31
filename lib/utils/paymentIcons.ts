/**
 * Returns the real payment icon URL from /payments/*.ico if the code/name matches
 * JazzCash, EasyPaisa, Bank Transfer, NayaPay, or Cash on Delivery.
 * SSOT utility for payment method icons across storefront & admin console.
 */
export function getPaymentMethodIcon(codeOrName?: string | null): string | null {
  if (!codeOrName || typeof codeOrName !== 'string') return null;
  const lower = codeOrName.toLowerCase().replace(/[\s_-]/g, '');
  if (lower.includes('jazzcash')) return '/payments/jazzcash.ico';
  if (lower.includes('easypaisa')) return '/payments/easypaisa.ico';
  if (lower.includes('nayapay')) return '/payments/nayapay.ico';
  if (lower.includes('banktransfer') || lower.includes('bank') || lower.includes('transfer')) {
    return '/payments/banktransfer.ico';
  }
  if (lower.includes('cod') || lower.includes('cashondelivery') || lower.includes('cash')) {
    return '/payments/cod.ico';
  }
  return null;
}
