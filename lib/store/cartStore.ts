import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant, ProductModifier, Coupon } from '@/lib/types';
import { CART_PERSIST_KEY, migrateLegacyStorageKeys } from '@/lib/store/storageKeys';

// One-time migration of legacy brand-prefixed keys (no cart is ever lost).
migrateLegacyStorageKeys();

interface CartStore {
  items: CartItem[];
  cartCreatedAt: string | null;
  appliedCoupon: Coupon | null;
  addItem: (product: Product, variant?: ProductVariant, modifiers?: ProductModifier[], qty?: number) => boolean;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  resetCartTimer: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
}

const calculateItemPrice = (
  product: Product,
  variant?: ProductVariant,
  modifiers?: ProductModifier[]
): number => {
  const price = variant?.price ?? product.price;
  const modifierTotal = modifiers?.reduce((sum, m) => sum + m.price, 0) ?? 0;
  return price + modifierTotal;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartCreatedAt: null,
      appliedCoupon: null,

      addItem: (product, variant, modifiers = [], qty = 1) => {
        const unitPrice = calculateItemPrice(product, variant, modifiers);
        const cartItemId = `${product.id}-${variant?.id ?? 'base'}-${modifiers.map(m => m.id).join('-')}`;

        const isExempt = Boolean(product.is_service || product.is_preorder);
        const availableStock = isExempt
          ? 999
          : typeof variant?.stock === 'number'
            ? variant.stock
            : typeof product.stock === 'number'
              ? product.stock
              : 999;

        if (!isExempt && availableStock <= 0) {
          return false;
        }

        let added = true;
        set(state => {
          const isFirstItem = state.items.length === 0;
          const newCartCreatedAt = isFirstItem ? new Date().toISOString() : state.cartCreatedAt;
          
          const existing = state.items.find(i => i.id === cartItemId);
          if (existing) {
            const currentQty = existing.quantity;
            if (!isExempt && currentQty >= availableStock) {
              added = false;
              return state;
            }
            const newQty = isExempt ? currentQty + qty : Math.min(currentQty + qty, availableStock);
            return {
              cartCreatedAt: newCartCreatedAt,
              items: state.items.map(i =>
                i.id === cartItemId
                  ? { ...i, quantity: newQty, total: unitPrice * newQty }
                  : i
              )
            };
          }

          const initialQty = isExempt ? qty : Math.min(qty, availableStock);
          return {
            cartCreatedAt: newCartCreatedAt,
            items: [...state.items, {
              id: cartItemId,
              product,
              selected_variant: variant,
              selected_modifiers: modifiers,
              quantity: initialQty,
              unit_price: unitPrice,
              total: unitPrice * initialQty
            }]
          };
        });

        return added;
      },

      removeItem: (cartItemId) =>
        set(state => {
          const newItems = state.items.filter(i => i.id !== cartItemId);
          const hasItems = newItems.length > 0;
          return {
            items: newItems,
            cartCreatedAt: hasItems ? state.cartCreatedAt : null,
            appliedCoupon: hasItems ? state.appliedCoupon : null
          };
        }),

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set(state => {
          const item = state.items.find(i => i.id === cartItemId);
          if (!item) return state;

          const isExempt = Boolean(item.product.is_service || item.product.is_preorder);
          const availableStock = isExempt
            ? 999
            : typeof item.selected_variant?.stock === 'number'
              ? item.selected_variant.stock
              : typeof item.product.stock === 'number'
                ? item.product.stock
                : 999;

          if (!isExempt && availableStock <= 0) {
            return {
              items: state.items.filter(i => i.id !== cartItemId)
            };
          }

          const safeQty = isExempt ? quantity : Math.min(quantity, availableStock);
          return {
            items: state.items.map(i =>
              i.id === cartItemId
                ? { ...i, quantity: safeQty, total: i.unit_price * safeQty }
                : i
            )
          };
        });
      },

      clearCart: () => set({ items: [], cartCreatedAt: null, appliedCoupon: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.total, 0),
      resetCartTimer: () => set({ cartCreatedAt: new Date().toISOString() }),
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
    }),
    {
      name: CART_PERSIST_KEY,
      version: 1,
      // Fool-proof migration: existing browsers have camelCase cart items in localStorage.
      // Convert them to snake_case on load and clamp quantities to available stock (RULE D13 + stock integrity).
      migrate: (persisted: unknown, _version: number) => {
        if (
          persisted &&
          typeof persisted === 'object' &&
          Array.isArray((persisted as { items?: unknown }).items)
        ) {
          const state = persisted as { items: Array<Record<string, unknown>> };
          state.items = state.items.map((i) => {
            const variant = (i.selected_variant ?? i.selectedVariant) as ProductVariant | undefined;
            const product = i.product as Product | undefined;
            const isExempt = Boolean(product?.is_service || product?.is_preorder);
            const rawStock = typeof variant?.stock === 'number'
              ? variant.stock
              : typeof product?.stock === 'number'
                ? product.stock
                : 999;
            const currentQty = (i.quantity as number) || 1;
            const safeQty = isExempt ? currentQty : Math.max(1, Math.min(currentQty, rawStock));
            const unitPrice = ((i.unit_price ?? i.unitPrice) as number) || 0;

            return {
              ...i,
              selected_variant: variant,
              selected_modifiers: i.selected_modifiers ?? i.selectedModifiers ?? [],
              unit_price: unitPrice,
              quantity: safeQty,
              total: unitPrice * safeQty,
              discount_amount: i.discount_amount ?? i.discountAmount,
              discount_type: i.discount_type ?? i.discountType,
              discount_value: i.discount_value ?? i.discountValue,
              added_later: i.added_later ?? i.addedLater,
            };
          });
        }
        return persisted as CartStore;
      },
    }
  )
);
