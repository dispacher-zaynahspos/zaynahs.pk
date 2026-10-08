# Product Cards 01–08 — Implementation Guide (Next.js)

> Ye cards **Ella theme ki copy nahi** hain (wo paid/proprietary hai). Screenshots dekh kar recreate kiye gaye hain aur `UI_CARDS.md` ke rules follow karte hain.
> Browser mein visual test **mene nahi kiya** (sandbox mein browser nahi tha) — pehle `html/` files 375px / 768px / 1280px par khol kar dekho.

## 1. Files
| Path | Kaam |
|---|---|
| `html/product-card-01..08.html` | Standalone preview. Neeche-left "Card controls" panel se saare controls live test karo. |
| `nextjs/product-cards.css` | Shared engine + 8 variants (`.pc-grid[data-card="01"]` se scoped). Ek baar import. |
| `nextjs/ProductGrid.tsx` | Grid wrapper: settings → `data-*` attributes + CSS variables, mobile focus. |
| `nextjs/ProductCard.tsx` | Single card (8 variants ek component). |
| `nextjs/types.ts` | `ProductCardSettings` (UI_CARDS.md keys), `CardProduct`. |
| `nextjs/card-variants.json` | Har card ka default (cols, gap, font, defaults, lock). |
| `nextjs/usage-example.tsx` | Page mein use. |

## 2. Setup (5 steps)
1. `nextjs/*` ko `components/product-cards/` mein copy karo.
2. Fonts: `Poppins` (01,03,04,06,07) aur `Inter` (02,05,08) — `next/font` se load karo, `--ff` unka `font-family` use karta hai.
3. `toCardProduct()` likho: apne product → `CardProduct`. **Swatches sirf real variants se** (`finalRenderedGroups`), dummy nahi.
4. `ProductGrid` ko `variant` ('01'–'08') + `store_settings` do.
5. Price formatting: `ProductCard.tsx` ka `money()` hata kar `formatPrice()` lagao. `<img>` ko `next/image` se replace kar sakte ho (parent `.pc-media` relative hai, `fill` use karo).

## 3. Layout / Responsive rules
| Screen | Columns | Note |
|---|---|---|
| ≥1024px | card ke default (4 ya 5) | `card-variants.json` → `cols` |
| 640–1023px | 3 | |
| <640px | 2 (ya 1 agar `card_mobile_columns=1`) | |

- **Container queries**: `.pc-media` ek `inline-size` container hai. Card chhota ho (≤200px) to buttons/labels khud chhote hote hain — isi se narrow mobile par clipping nahi hoti (pehle wali files mein yehi bug tha).
- Browser support: container queries + `:is()` — sab modern browsers (Chrome 105+, Safari 16+, Firefox 110+).

## 4. Action rail (UI_CARDS.md ke mutabiq)
Wishlist + Quick view + Cart **ek hi `.pc-actions` container** mein hain aur **saath spawn** hote hain (desktop hover / mobile focus). Compare icon nahi hai. Har card mein buttons ki **position sample jaisi** hai:

| Card | Wishlist | Quick view | Cart |
|---|---|---|---|
| 01 | circle top-right | circle, uske neeche | full-width bordered bar (bottom) |
| 02 | small circle top-left | dark "Quick View" label, center | **hamesha dikhta** bordered button (body mein, `quickcart` toggle se hide) |
| 03 | circle, center-top | "QUICK VIEW" strip (bottom) | navy bar center + hover stars |
| 04 | "Add to wishlist" text (white panel) | "Quick view" top-right | bordered box |
| 05 | circle top-left | circle top-right | white box (bottom) |
| 06 | square rail, right se slide-in | | |
| 07 | bottom-right row (3 icons) + image arrows | | |
| 08 | vertical rail bottom-right (3 icons) | | |

Sample mein wishlist kuch cards (05, 07, 08) mein hamesha dikhta tha; **MD ka rule** "wishlist alag sticky nahi" follow kiya, isliye ab wo baaki buttons ke saath spawn hota hai.

## 5. Controls → kya karta hai
| Key | Effect |
|---|---|
| `card_alignment` | `--ai/--ta/--jc` (text, price) |
| `image_aspect_ratio` | `--ratio` + `data-ratio` (`auto` natural height) |
| `card_image_fit` | `--fit` |
| `title_line_limit` | `--lines` (`none` = 999) |
| `image_hover_style` | `data-hover` (8 styles, `.i2` second image) |
| `card_icon_style` | `data-icon` (pill/minimal/luxe/brutalist/glass — no blur) |
| `card_mobile_activation` | `scroll` → `.is-in-focus`; `touch` → tap; `off` |
| `card_mobile_columns` | `data-mcols` |
| `enable_variant_swatches`, `swatch_limit`, `swatch_shape`, `archive_swatch_size`, `archive_swatch_align` | swatches (+N, two-tone support) |
| `card_show_*` | `data-wishlist/quickview/quickcart/stars/desc/sizes` |
| `card_shadow`, `card_hover_lift`, `card_border_enabled` | card appearance |
| `card_compare_color`, `card_sale_price_color` | `--cmp`, `--salecol` |
| `card_elements_order` | CSS `order` (rating/price/title/swatches) |

**Locked layouts (MD matrix jaisa):** Card **04** (stars vendor row mein) aur **05** (swatches title se pehle, stars + "MORE SIZES" last row) ka order fixed hai — `card_elements_order` unpe apply nahi hota. Customizer mein tooltip dikhao: *"This archetype uses a dedicated layout."*

## 6. Per-card data jo sample jaisa hai
- Title/vendor formats: 01 "(Product N) Sample - Clothing And Accessory Boutiques…", 02 `Brand®` + Auto Parts, 03 Men Clothing, 04/05 `ELLA - HALOTHEMES`, 06 Glasso And Eyewear, 07 `(Bell Doll) …`, 08 `Motown Tress … Wig`.
- Badges: 01 Sale/Bundle, 02/03/06 Sale, 04 SALE, 05 Sale (gold), 07 `-XX%`, 08 outlined Sale.
- Price: sale pehle, cut price baad mein (MD rule PRICE1); "From" jab `hasPriceRange`.
- Swatches: two-tone (`color2`) aur `+N`.
- "MORE SIZES AVAILABLE": 05, 07 (`hasMoreSizes` + `card_show_sizes`).
- Rating: 02 (title ke baad), 03 (hover pe image par), 04 (vendor ke saath right), 05 (last row). 01/06/07/08 mein default off.

## 7. Known differences / limits
- Swatch size MD ki scale (6–18px) mein hai; sample (~26px) se chhota. Bada chahiye to `archive_swatch_size='xxl'` ya scale badhao.
- Card 08 ke sample mein swatches image thumbnails the — yahan `CardSwatch.image` hover pe main image badalti hai, swatch khud rang dikhata hai.
- Image carousel arrows (07) abhi UI hain, slider logic nahi. Apna carousel jodo.
- Base cards (`style1`, `showcase_*`) aur Elessi `card_01–10` **touch nahi kiye** — ye 8 naye archetypes hain; naye keys (`card_style` mein) add karne honge.
- Card 02 ka persistent ADD TO CART `quickcart` toggle se hide hota hai.

## 8. QA checklist
- [ ] 375px, 414px, 768px, 1280px par har card: koi button/label clip ya overlap nahi.
- [ ] Hover (desktop) aur scroll-focus (mobile) par rail ek saath aaye.
- [ ] Toggles off karne par sirf wahi element gayab ho, layout na tute.
- [ ] `swatch_limit` / `+N` sahi; variants na hon to swatch row empty.
- [ ] Kisi card mein compare icon nahi.
- [ ] Tap card → PDP; tap action/swatch → sirf action (z-index 25 vs overlay 1).
