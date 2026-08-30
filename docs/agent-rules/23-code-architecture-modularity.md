# 23 — RULE O1: Modular Code Architecture & Separate Modal/Tab Files

- **One file per modal/tab**: every settings tab, dashboard form, modal dialog, sliding sheet, or customizer property panel MUST live in its own dedicated file (e.g. under `components/admin/customizer/sections/` or `components/admin/settings/`).
- **No multi-modal/multi-feature files**: strictly forbidden to group multiple modals, multiple settings tabs, or multiple distinct features inside a single file. Every modal/tab lives in its own isolated file.
- **File length limits**: individual files should stay under 500 lines where possible. Monolithic components exceeding 600 lines are strictly forbidden (confusing, slower page loads, harder to update).
- **Strict separation of concerns**: master containers focus solely on page layout, state orchestration, and API bindings — delegate UI blocks and input handlers to child components via clean props interfaces.
