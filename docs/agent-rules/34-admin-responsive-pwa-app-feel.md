# 34 — RULE PWA1: Admin Responsive PWA & Native Phone App UI System (MANDATORY)

> **Scope**: Strictly enforced on ALL Admin Dashboards, Management Portals, POS Systems, Courier Manager, and Internal Tools across all clone stores (`/admin/*`, POS, standalone manager apps).
> Read this before ANY UI, layout, page, popup, navigation, or styling work on the admin side.

---

## 1. Golden Rules (Non-Negotiable)
1. **Phone and desktop are built TOGETHER in the same component** — Never ship one without the other.
2. **A UI task never changes business logic, APIs, database, auth, routes, or stored data**.
3. **If a UI change needs a logic change, STOP and ask**.
4. **Never remove any existing feature, field, filter, or action** — If something cannot fit on mobile screen, move it to a sub-sheet or "More" drawer; do NOT delete it.
5. **Zero Data Loss & Inventory Verification**: Before touching any screen, list every action, tab, and filter. Nothing may disappear.

---

## 2. Breakpoints & Layout Architecture
* **Under 860px (< 860px): Native Mobile App UI (`touch-first`)**
* **860px and Above (≥ 860px): Desktop Dashboard UI (`keyboard/mouse`)**
* Switch layout with CSS and responsive components. Never build two separate apps and never use iframes.

---

## 3. Phone Layout Hierarchy (< 860px)
```
+-----------------------------------+  Top safe area (notch, Dynamic Island)
| Compact Header / Back Bar (Sticky)|  44px min height, back button on pushed screens
| Large Screen / Section Title      |  Text-xl/2xl, clear hierarchy
| Content Area (Lists, Cards)       |  Scrolls inside screen with smooth momentum
+-----------------------------------+
| Bottom Tab Bar (Max 5 Tabs)       |  Fixed, above home indicator (safe-area-inset-bottom)
+-----------------------------------+  Bottom safe area
```
1. **Navigation**: Bottom Tab Bar (Maximum 5 items). Extra items go under a dedicated "More" screen/sheet. No collapsible sidebar on phone.
2. **Header**: Sticky, respects the notch (`pt-[env(safe-area-inset-top)]`). Back button appears only on drill-down / pushed screens.
3. **Footer**: Hidden on phone in admin. Status bars collapse into simple top indicators.
4. **Content Padding**: Bottom padding of content MUST clear the bottom tab bar plus the home indicator (`pb-24` minimum).
5. **Landscape**: Left and right safe areas (`env(safe-area-inset-left)`, `env(safe-area-inset-right)`) respected.

---

## 4. Desktop Layout Hierarchy (≥ 860px)
* **Sidebar**: Collapsible left sidebar with smart scrollbar.
* **Top Bar**: Sticky header with breadcrumbs, quick search, theme toggle, and user profile.
* **Content**: Centered content container (`max-w-[1280px]` or `max-w-[1440px]`), dense data presentation.
* **Tables**: Sticky header tables with horizontal card scroll for dense columns, stat strips, right-side detail drawer.

---

## 5. Component Transformation Matrix (Desktop ➔ Mobile Phone)

| Desktop Element (≥ 860px) | Mobile Phone Native Equivalent (< 860px) | Implementation Standard |
| :--- | :--- | :--- |
| **Wide Data Table** | **Grouped Card List** | Each row becomes a high-density touch card showing key fields + status dot. Tap card to open full details. |
| **Centered Modal Dialog** | **Native Bottom Sheet** | Slides up from bottom (`max-h-[92dvh]`), drag handle at top, inner scrolling, fixed bottom action buttons. |
| **Side Detail Drawer** | **Full / Half Bottom Sheet** | Replaces slide-over drawer with smooth bottom sheet or full-screen pushed sheet. |
| **Inline Filter Toolbar** | **Filter Sheet Button + Modal** | Single "Filters (N active)" button opening a bottom sheet with grouped chips and sliders. |
| **Hover Actions / Menus** | **Always-Visible / Tap Actions** | Touch has no hover: Action icons, swipe-to-reveal, or 3-dots `More` menu. |
| **Toast Notifications (Top-Right)**| **Full-Width Top Banner / Pill** | Floats below notch (`top-safe`), full-width centered pill with haptic-like animation. |

---

## 6. Sizing, Touch & Keyboard Rules (All Phones)
1. **Dynamic Viewport Height**: Always use `100dvh` or `min-h-[100dvh]`, NEVER a fixed `100vh` (avoids address bar jump).
2. **Touch Targets**: Minimum `44px × 44px` for all interactive elements, buttons, icons, and checkboxes.
3. **Form Inputs**: Minimum `16px` font size (`text-base sm:text-sm`) to strictly prevent iOS Safari auto-zoom on input focus.
4. **No Horizontal Page Overflow**: The root layout has `overflow-x-hidden`. Wide data scrolls strictly inside its own container/card.
5. **Typography**: Text truncates with clean ellipsis (`truncate`). Numbers and prices use tabular figures (`font-mono` or `tabular-nums`).
6. **Virtual Keyboard Handling**: When keyboard opens, the focused input field and primary submit button stay visible (`overscroll-contain`, scroll-into-view).
7. **Hardware Support**: Tested and verified on small Android (360px), iPhone SE (375px), iPhone Pro/Max (390px/430px), foldables, and iPad.

---

## 7. PWA Essentials & Native App Feel
* **Viewport**: Covers full screen including notch (`viewport-fit=cover`).
* **Theme Color**: Meta `theme-color` configured for both light (`#ffffff`) and dark (`#0f0f1b`).
* **Installable**: Clean manifest, high-res PWA icons, `display: standalone`.
* **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by replacing sliding animations with subtle opacity fades.

---

## 8. Design Language & Aesthetics (Admin/POS)
* **Palette**: One clean primary accent color. All other surfaces neutral gray/slate.
* **Status Indicators**: Status displayed as a **small colored dot (6px–8px) + plain text** (e.g., `● Shipped`, `● Delivered`, `● Pending`). No rainbow boxes or glowing tinted backgrounds.
* **Validation**: Warnings use soft muted background on the affected field only.
* **Radii & Grid**: 8px spacing grid. Cards use `rounded-xl` (12px–14px), bottom sheets use `rounded-t-[20px]`.
* **Tokens Only**: Light and dark mode driven entirely by semantic color tokens (`bg-surface`, `text-primary`, `border-subtle`). Zero arbitrary hex values.

---

## 9. Verification & "Definition of Done" Checklist
Before completing any UI change in Admin/POS:
- [ ] **Inventory Check**: Every tab, button, filter, and action from desktop exists on mobile.
- [ ] **Notch & Home Bar**: Content does not overlap top notch or bottom iOS home swipe indicator.
- [ ] **Tab Bar Clearance**: Page bottom has padding so bottom navigation never covers content or buttons.
- [ ] **Keyboard Test**: Opening keyboard on input fields does not break layout or hide submit button.
- [ ] **Theme Check**: Light mode and dark mode tested and contrast verified.
- [ ] **Zero Console Errors**: Clean runtime, zero unhandled exceptions.
