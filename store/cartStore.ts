import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant, ProductModifier, Coupon } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  cartCreatedAt: string | null;
  appliedCoupon: Coupon | null;
  addItem: (product: Product, variant?: ProductVariant, modifiers?: ProductModifier[], qty?: number) => void;
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

        set(state => {
          const isFirstItem = state.items.length === 0;
          const newCartCreatedAt = isFirstItem ? new Date().toISOString() : state.cartCreatedAt;
          
          const existing = state.items.find(i => i.id === cartItemId);
          if (existing) {
            return {
              cartCreatedAt: newCartCreatedAt,
              items: state.items.map(i =>
                i.id === cartItemId
                  ? { ...i, quantity: i.quantity + qty, total: unitPrice * (i.quantity + qty) }
                  : i
              )
            };
          }
          return {
            cartCreatedAt: newCartCreatedAt,
            items: [...state.items, {
              id: cartItemId,
              product,
              selected_variant: variant,
              selected_modifiers: modifiers,
              quantity: qty,
              unit_price: unitPrice,
              total: unitPrice * qty
            }]
          };
        });
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
        set(state => ({
          items: state.items.map(i =>
            i.id === cartItemId
              ? { ...i, quantity, total: i.unit_price * quantity }
              : i
          )
        }));
      },

      clearCart: () => set({ items: [], cartCreatedAt: null, appliedCoupon: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.total, 0),
      resetCartTimer: () => set({ cartCreatedAt: new Date().toISOString() }),
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
    }),
    {
      name: 'zaynahs-cart',
      version: 1,
      // Fool-proof migration: existing browsers have camelCase cart items in localStorage.
      // Convert them to snake_case on load so NO cart is ever wiped (RULE D13 + no data loss).
      migrate: (persisted: any, _version: number) => {
        if (persisted && Array.isArray(persisted.items)) {
          persisted.items = persisted.items.map((i: any) => ({
            ...i,
            selected_variant: i.selected_variant ?? i.selectedVariant,
            selected_modifiers: i.selected_modifiers ?? i.selectedModifiers ?? [],
            unit_price: i.unit_price ?? i.unitPrice,
            total: i.total,
            discount_amount: i.discount_amount ?? i.discountAmount,
            discount_type: i.discount_type ?? i.discountType,
            discount_value: i.discount_value ?? i.discountValue,
            added_later: i.added_later ?? i.addedLater,
          }));
        }
        return persisted;
      },
    }
  )
);
