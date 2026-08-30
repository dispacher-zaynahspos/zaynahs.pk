# 09 — E-commerce / POS Specific Rules

- Stock/inventory changes must be atomic + logged (no double-sell).
- Payment flow (JazzCash/EasyPaisa): graceful fallback, silent fail is banned.
- Order/sale data must never be lost — offline queue/sync retry.
- PKR pricing format must be consistent across POS and storefront.

## Multi-project reference table
| Project | Supabase Ref | Cloudflare Zone ID | Site URL |
|---------|-------------|------------|----------|
| TotVogue | ziucrfpebpxijqhwmqre | e4aceeacdc4f6a1677e92823df1651fd | www.totvogue.pk |
| Zaynahs | unfdpfmjqljbjydgsccr | 10d964449186f64d7896f8dcac4e5eff | www.zaynahs.pk |
| MiniMahal | mgwkcumurrllhpjvfezz | 6acd493022cd0f2d5a9c290088b5327a | www.minimahal.com |
| LittleMister | ljknmwianiswkalifueb | 063a3d5c72d44b3654aa60b17ed94863 | www.littlemister.pk |

(Full credential map: [26-project-reference-table.md](26-project-reference-table.md).)

## No customer accounts (also see RULE A2 in autonomy/architecture context)
Customers do NOT register or log in. Cart is stored in `localStorage` via Zustand `persist`. Orders go via WhatsApp only — see [10-whatsapp-order-flow.md](10-whatsapp-order-flow.md).
