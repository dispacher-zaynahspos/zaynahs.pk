# 27 — RULE SSOT1: Single Source of Truth (ZERO duplicate implementations)

> Hard architectural rule. Applies to EVERY domain, module, menu, settings tab, customizer section, grid, button, toggle, and data model — no exception.

## The rule
- Agar koi feature/setting/control/grid/data **ek se zyada jagah** dikhta hai (Settings, Customizer, ya koi aur module), to uska **exactly ONE shared source** hona chahiye: ek shared component + ek shared data model + ek shared save/fetch logic — jahan bhi dikhe wahan **import/reuse** ho.
- Kabhi bhi kisi cheez ka **doosra, alag-coded version** mat banao jo pehle se kahin exist karta hai. Agar genuinely do jagah chahiye (e.g. Customizer me quick-access jo Settings me full form me hai), doosri jagah **wahi exact component/logic/state reuse** kare — re-implementation / copy-paste variant / "looks similar but different code" strictly BANNED.
- Ye applies to: settings tabs, form fields, buttons, grids (product/category/collections/variant), toggles, AI config, cache/save logic — har domain, har module, bina exception.

## Root-cause pattern to hunt (verified in this repo)
Settings form aur Homepage Customizer dono **same `store_settings` columns** likhte hain do **alag React state trees + alag save triggers** se (Settings = manual Save bar; Customizer = 1s debounced autosave) → **last-writer-wins drift**. Ye har duplicated column ka bug-source hai. Confirmed duplicate groups: product-card/swatch (triple), header/top-bar/newsletter (quad), footer/social, trust/safe-checkout/fake-views, ticker, dashboard-vs-reporting widgets. (Details + canonical decisions: `docs/DEEP_AUDIT_PLAN.md` §3.)

## Before writing ANY new code (mandatory pre-check)
1. Search `components/`, `lib/`, `app/` for an existing component/hook/util/column that already does this or something close.
2. Exist karta hai → **use/import/extend** the shared one. Duplicate/rewrite/copy-paste-tweak mat karo.
3. Naya sirf tab jab koi shared module reasonably cover na kare; naya shared piece `components/shared/` ya `components/common/` me jaaye.

## Consolidation procedure (when a duplicate is found)
a. Har duplicate pair/group list karo: kya hai, har copy ka exact path, same DB cols/service?, drifted?, canonical kaunsa.
b. ONE canonical shared implementation choose karo; baaki ko remove ya refactor-to-reuse. "Just in case" dono mat rakho.
c. Settings + Customizer ke andar har tab/section/grid/menu clean, logical, consistent order me ho — no missing options, no half-finished tabs, no orphaned/broken entries.
d. Koi grid/tab jo expected sub-options miss kar raha ho (jaise ek grid me responsive-columns control nahi jab similar grids me hai) = "broken/incomplete", flag + fix.

## Definition of done
- Poore app me **zero features** do alag code paths me.
- Har menu/tab/grid/setting complete, correctly ordered, aur ya to fully functional ya explicitly removed — kuch bhi half-built / fake / duplicated nahi.
- No per-case/per-page patches — fixes generic + reproducible across the whole system (see [01-core-operating-principles.md](01-core-operating-principles.md) RULE OP1).
