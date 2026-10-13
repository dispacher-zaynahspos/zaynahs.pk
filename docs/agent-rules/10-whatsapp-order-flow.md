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

## RULE W3 — Checkout button wording, popup-safe redirect & resilience (STRICT)
1. **Checkout Button Copy:**
   - The primary checkout submission button must read **"Confirm Order"** (never "Confirm Order via WhatsApp", "Submit via WhatsApp", etc.).
2. **Popup-Block Safe Redirection:**
   - Modern mobile browsers (iOS Safari, Android Chrome, Samsung Internet) block `window.open(url, '_blank')` if called after an asynchronous network call (`await createOrder`).
   - On successful checkout, when WhatsApp redirection is enabled, redirect directly using `window.location.assign(whatsappUrl)` (or `window.location.href = whatsappUrl`). Never rely on `window.open('_blank')` in async handlers.
3. **Admin Auto-Redirect Toggle (`enable_whatsapp_redirect`):**
   - Stored in `store_settings.enable_whatsapp_redirect` (BOOLEAN, default `true`).
   - Configurable in Admin Settings -> WhatsApp tab.
   - When enabled: user is automatically redirected to WhatsApp upon order creation.
   - When disabled: order is created, cart is cleared, and an inline order confirmation view is presented with a clear manual "Send Order on WhatsApp" button.
4. **Idempotency Guarantee:**
   - Every order submission generates a client-side UUID `idempotency_key`.
   - Repeated taps or network retries check for this key in `orders.idempotency_key` and return the existing order without creating duplicates or double decrements.
5. **Checkout Error Fallback & Logging:**
   - Any order creation failure must be recorded in `failed_order_attempts` with customer name, phone, cart items, total, and error message.
   - The checkout UI must render a dedicated retry banner with:
     - `[Try again]` action
     - Prefilled WhatsApp backup link `[Send my order on WhatsApp]` so the customer can complete their purchase without loss.
6. **Floating Widget Isolation:**
   - The floating WhatsApp / contacts widget (`FloatingContacts.tsx`) must automatically hide on `/cart` and `/checkout` paths to prevent visual overlap with checkout buttons and voucher badges.

