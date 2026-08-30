# 10 — WhatsApp Order Flow Rules

## RULE W1 — Message format
```typescript
// lib/utils/whatsapp.ts
export const generateWhatsAppMessage = (cart: CartItem[], settings: StoreSettings): string => {
  const lines = cart.map(item => {
    const variant = item.selectedVariant
      ? ` (${Object.values(item.selectedVariant).join(', ')})`
      : '';
    const modifiers = item.selectedModifiers?.length
      ? ` + ${item.selectedModifiers.map(m => m.name).join(', ')}`
      : '';
    return `• ${item.product.name}${variant}${modifiers} x${item.quantity} = ${formatPrice(item.total)}`;
  });

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  return [
    `*${settings.storeName} — New Order*`,
    ``,
    ...lines,
    ``,
    `*Total: ${formatPrice(total)}*`,
    ``,
    `Please confirm my order. Thank you! 🙏`
  ].join('\n');
};

export const buildWhatsAppURL = (phone: string, message: string): string => {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};
```
`formatPrice` is imported from `@/lib/utils/whatsapp` project-wide — see [15-shared-components-ui-modules.md](15-shared-components-ui-modules.md).

## RULE W2 — Redirect target
- Mobile: opens the WhatsApp app directly.
- Desktop: opens web.whatsapp.com.
- Always use `wa.me` format — never `api.whatsapp.com`.
- Phone number stored WITHOUT `+` or spaces in the DB.

## Admin middleware (RULE A1)
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = createServerClient(/* ... */);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```
> Note: per RULE C4 ([08-caching-isr-ssr.md](08-caching-isr-ssr.md)), the root proxy file must be named `proxy.ts`, not `middleware.ts`, to avoid RSC caching skew with Cloudflare.

## No customer accounts (RULE A2)
Customers do NOT register/login. Cart lives in `localStorage` via Zustand persist. Orders go via WhatsApp only.
