# 12 — Testing & Verification Rules

- After every fix/feature: test happy path + at least 1 edge case.
- Critical flows (checkout, payment, stock) require mandatory manual/auto testing.
- Before a breaking change: run existing tests/build first.
- Test empty states, missing values, rate limits, and network failures before shipping (see [01-core-operating-principles.md](01-core-operating-principles.md), Senior Habit #6).

Full test suite reference: `docs/STORE_TESTING_GUIDE.md`.

## RULE V1 — Fool-proof proof-of-fix (STRICT — run before declaring ANY task "done")
Kisi bhi task ko complete tabhi maano jab ye saare boxes tick ho jayein (assume/guess nahi — actual verify):
- [ ] **Runtime verified**: actual behavior chalaa ke dekha (server logs / network call / DB row / UI), sirf code padh ke assume nahi.
- [ ] **Root cause, not band-aid**: real cause fix hua, symptom hide nahi kiya ([01-core-operating-principles.md](01-core-operating-principles.md) RULE OP1). Errors UI + logs me surface ho rahe hain, silently swallow nahi.
- [ ] **Atomic**: har touched write-path all-or-nothing hai — partial state impossible ([05-database-supabase.md](05-database-supabase.md) RULE D15).
- [ ] **Cache invalidation**: har touched write-path shared utility ke through saari layers invalidate karta hai, save ke baad manual purge zaroori nahi ([08-caching-isr-ssr.md](08-caching-isr-ssr.md) RULE C10). Save → reload → fresh data verify kiya.
- [ ] **No leakage**: koi secret/data/stale-value leak nahi ([01-core-operating-principles.md](01-core-operating-principles.md) RULE OP2).
- [ ] **snake_case + UUID**: jo bhi touch kiya wo `snake_case` (RULE D13) aur UUID PK (RULE D14) compliant hai.
- [ ] **Docs synced**: schema change hua to numbered migration + `SUPER_MASTER_SCHEMA.sql` (RULE D6) + `docs/SCHEMA_CHANGE_LOG.md` (RULE D5) + `lib/types.ts` + RLS docs — sab same task me update.
- [ ] **Build/tests green**: existing build/tests pass; naya feature/bug → happy path + ≥1 edge case tested.
