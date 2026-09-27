import { CartItem, StoreSettings } from '@/lib/types';

export const formatPrice = (amount: number | undefined | null, symbol = 'Rs.'): string =>
  `${symbol} ${(amount ?? 0).toLocaleString('en-PK')}`;

export const generateWhatsAppMessage = (
  items: CartItem[],
  settings: StoreSettings
): string => {
  const lines = items.map(item => {
    const variantParts = [];
    if (item.selected_variant?.color) variantParts.push(item.selected_variant.color);
    if (item.selected_variant?.size) variantParts.push(item.selected_variant.size);
    if (item.selected_variant?.material) variantParts.push(item.selected_variant.material);
    if (item.selected_variant?.custom_value) variantParts.push(item.selected_variant.custom_value);

    const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : '';
    const modifierStr = item.selected_modifiers.length
      ? ` + ${item.selected_modifiers.map(m => m.name).join(', ')}`
      : '';

    const discountStr = item.discount_amount && item.discount_amount > 0 
      ? ` (Discount: -${formatPrice(item.discount_amount, settings.currency_symbol)})` 
      : '';

    return `• ${item.product.name}${variantStr}${modifierStr} x${item.quantity}${discountStr} = ${formatPrice(item.total, settings.currency_symbol)}`;
  });

  const total = items.reduce((sum, i) => sum + i.total, 0);

  return [
    `*${settings.store_name}*`,
    ``,
    settings.whatsapp_greeting,
    ``,
    ...lines,
    ``,
    `*Total: ${formatPrice(total, settings.currency_symbol)}*`,
    ``,
    settings.whatsapp_footer
  ].join('\n');
};

export const cleanWhatsAppPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // 1. Remove all non-digits
  let clean = phone.replace(/\D/g, '');
  
  // 2. Strip leading 00 if present
  if (clean.startsWith('00')) {
    clean = clean.slice(2);
  }
  
  // 3. Handle Pakistani phone number standard formatting
  // Local: starts with 0 and has 11 digits (e.g. 03284114551 -> 923284114551)
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  }
  // Local missing zero: starts with 3 and has 10 digits (e.g. 3284114551 -> 923284114551)
  else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  // Common typo: replacing '03' with '92' (e.g. 92284114551 -> 923284114551)
  else if (clean.startsWith('922') && clean.length === 11) {
    clean = '9232' + clean.slice(3);
  }
  // Common typo: combining +92 and 03 (e.g. 9203284114551 -> 923284114551)
  else if (clean.startsWith('920') && clean.length === 13) {
    clean = '92' + clean.slice(3);
  }
  
  return clean;
};

export const buildWhatsAppURL = (phone: string, message: string): string => {
  const cleanPhone = cleanWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

